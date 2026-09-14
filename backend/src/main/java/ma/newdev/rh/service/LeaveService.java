package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.LeaveProcessDto;
import ma.newdev.rh.dto.request.LeaveRequestDto;
import ma.newdev.rh.entity.*;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.LeaveRequestRepository;
import ma.newdev.rh.repository.LeaveTypeRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public List<LeaveRequest> getMyLeaves(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        return leaveRepository.findByEmployeeIdOrderByDateSoumissionDesc(employee.getId());
    }

    public List<LeaveRequest> getPendingLeaves() {
        return leaveRepository.findByStatutOrderByDateSoumissionAsc(LeaveStatus.EN_ATTENTE);
    }

    public LeaveRequest submitLeaveRequest(String email, LeaveRequestDto requestDto) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        LeaveType typeConge = leaveTypeRepository.findById(requestDto.getIdTypeConge())
                .orElseThrow(() -> new ResourceNotFoundException("Type de congé introuvable"));

        if (requestDto.getDateFin().isBefore(requestDto.getDateDebut())) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début");
        }

        if (typeConge.getCategorie() == CategorieConge.ANNUEL) {
            double remaining = (employee.getSoldeCongeAcquis() != null ? employee.getSoldeCongeAcquis() : 21.0)
                    - (employee.getSoldeCongePris() != null ? employee.getSoldeCongePris() : 0.0);
            if (requestDto.getJoursOuvrables() > remaining) {
                throw new IllegalArgumentException("Votre solde de congés est insuffisant (Solde disponible : " + remaining + " jours)");
            }
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .typeConge(typeConge)
                .dateDebut(requestDto.getDateDebut())
                .dateFin(requestDto.getDateFin())
                .joursOuvrables(requestDto.getJoursOuvrables())
                .statut(LeaveStatus.EN_ATTENTE)
                .commentaire(requestDto.getCommentaire())
                .build();

        LeaveRequest savedLeave = leaveRepository.save(leaveRequest);

        auditService.logAction("SUBMIT_LEAVE", "LeaveRequest", savedLeave.getId(), null, java.util.Map.of(
            "id", savedLeave.getId(),
            "employeeId", savedLeave.getEmployee().getId(),
            "employeeName", savedLeave.getEmployee().getNomComplet(),
            "typeConge", savedLeave.getTypeConge().getNom(),
            "categorie", savedLeave.getTypeConge().getCategorie().name(),
            "dateDebut", savedLeave.getDateDebut().toString(),
            "dateFin", savedLeave.getDateFin().toString(),
            "joursOuvrables", savedLeave.getJoursOuvrables(),
            "statut", savedLeave.getStatut().toString()
        ));

        // Notify OWNER
        List<User> owners = userRepository.findByRole(Role.OWNER);
        for (User owner : owners) {
            notificationService.createNotification(
                    owner,
                    user,
                    TypeNotification.LEAVE_SUBMITTED,
                    "Nouvelle demande de congé de " + employee.getNomComplet() + " (" + requestDto.getJoursOuvrables() + " jours)",
                    savedLeave.getId(),
                    "LEAVE_REQUEST"
            );
        }

        // Notify RH
        List<User> rhs = userRepository.findByRole(Role.RH);
        for (User rh : rhs) {
            notificationService.createNotification(
                    rh,
                    user,
                    TypeNotification.LEAVE_SUBMITTED,
                    "Nouvelle demande de congé de " + employee.getNomComplet() + " (" + requestDto.getJoursOuvrables() + " jours)",
                    savedLeave.getId(),
                    "LEAVE_REQUEST"
            );
        }

        return savedLeave;
    }

    @Transactional
    public LeaveRequest processLeaveRequest(Long id, String rhEmail, LeaveProcessDto processDto) {
        User rhUser = userRepository.findByCourriel(rhEmail)
                .orElseThrow(() -> new ResourceNotFoundException("RH introuvable"));

        LeaveRequest request = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de congé introuvable"));

        if (request.getEmployee() != null && request.getEmployee().getUser() != null
                && request.getEmployee().getUser().getRole() == Role.OWNER) {
            throw new UnauthorizedException("Les congés du propriétaire ne peuvent pas être traités.");
        }

        if (Boolean.FALSE.equals(processDto.getApprove()) && (processDto.getCommentaire() == null || processDto.getCommentaire().trim().isEmpty())) {
            throw new IllegalArgumentException("Un commentaire est obligatoire pour refuser une demande de congé.");
        }

        java.util.Map<String, Object> oldState = java.util.Map.of(
            "id", request.getId(),
            "employeeId", request.getEmployee() != null ? request.getEmployee().getId() : -1,
            "statut", request.getStatut().toString(),
            "commentaireDecision", request.getCommentaireDecision() != null ? request.getCommentaireDecision() : ""
        );

        request.setStatut(Boolean.TRUE.equals(processDto.getApprove()) ? LeaveStatus.APPROUVE : LeaveStatus.REFUSE);
        request.setCommentaireDecision(processDto.getCommentaire());
        request.setDecideur(rhUser);
        request.setDateDecision(LocalDateTime.now());

        if (Boolean.TRUE.equals(processDto.getApprove())) {
            Employee employee = request.getEmployee();
            if (employee != null && request.getTypeConge() != null && request.getTypeConge().getCategorie() == CategorieConge.ANNUEL) {
                double currentPris = employee.getSoldeCongePris() != null ? employee.getSoldeCongePris() : 0.0;
                employee.setSoldeCongePris(currentPris + request.getJoursOuvrables());
                employeeRepository.save(employee);
            }
        }

        LeaveRequest updatedRequest = leaveRepository.save(request);

        java.util.Map<String, Object> newState = java.util.Map.of(
            "id", updatedRequest.getId(),
            "employeeId", updatedRequest.getEmployee() != null ? updatedRequest.getEmployee().getId() : -1,
            "statut", updatedRequest.getStatut().toString(),
            "commentaireDecision", updatedRequest.getCommentaireDecision() != null ? updatedRequest.getCommentaireDecision() : ""
        );

        auditService.logAction(
            Boolean.TRUE.equals(processDto.getApprove()) ? "APPROVE_LEAVE" : "REFUSE_LEAVE",
            "LeaveRequest",
            updatedRequest.getId(),
            oldState,
            newState
        );

        // Notify Employe
        notificationService.createNotification(
                request.getEmployee().getUser(),
                rhUser,
                Boolean.TRUE.equals(processDto.getApprove()) ? TypeNotification.LEAVE_APPROVED : TypeNotification.LEAVE_REFUSED,
                "Votre demande de congé a été " + (Boolean.TRUE.equals(processDto.getApprove()) ? "approuvée" : "refusée"),
                updatedRequest.getId(),
                "LEAVE_REQUEST"
        );

        return updatedRequest;
    }

    @Transactional
    public LeaveRequest cancelLeaveRequest(Long id, String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        LeaveRequest request = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de congé introuvable"));

        // Only the employee who submitted it can cancel it
        boolean isOwnerOfRequest = request.getEmployee() != null 
                && request.getEmployee().getUser() != null 
                && request.getEmployee().getUser().getId().equals(user.getId());

        if (!isOwnerOfRequest) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à annuler cette demande de congé");
        }

        if (request.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Seules les demandes en attente peuvent être annulées");
        }

        request.setStatut(LeaveStatus.ANNULE);
        LeaveRequest updatedRequest = leaveRepository.save(request);

        auditService.logAction(
            "CANCEL_LEAVE",
            "LeaveRequest",
            updatedRequest.getId(),
            java.util.Map.of("id", request.getId(), "statut", "EN_ATTENTE"),
            java.util.Map.of("id", updatedRequest.getId(), "statut", "ANNULE")
        );

        // Notify OWNER
        List<User> owners = userRepository.findByRole(Role.OWNER);
        for (User owner : owners) {
            notificationService.createNotification(
                    owner,
                    user,
                    TypeNotification.ANNOUNCEMENT,
                    "Demande de congé annulée par " + request.getEmployee().getNomComplet(),
                    updatedRequest.getId(),
                    "LEAVE_REQUEST"
            );
        }

        // Notify RH
        List<User> rhs = userRepository.findByRole(Role.RH);
        for (User rh : rhs) {
            notificationService.createNotification(
                    rh,
                    user,
                    TypeNotification.ANNOUNCEMENT,
                    "Demande de congé annulée par " + (isRH && !isOwnerOfRequest ? "RH (pour " + request.getEmployee().getNomComplet() + ")" : request.getEmployee().getNomComplet()),
                    updatedRequest.getId(),
                    "LEAVE_REQUEST"
            );
        }

        return updatedRequest;
    }
}
