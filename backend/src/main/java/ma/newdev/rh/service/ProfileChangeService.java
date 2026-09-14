package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ProfileChangeRequestDto;
import ma.newdev.rh.entity.Employee;
import ma.newdev.rh.entity.ProfileChangeRequest;
import ma.newdev.rh.entity.ProfileChangeStatus;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.ProfileChangeRequestRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import ma.newdev.rh.entity.TypeNotification;
import ma.newdev.rh.entity.Role;

@Service
@RequiredArgsConstructor
public class ProfileChangeService {

    private final ProfileChangeRequestRepository profileChangeRepo;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public List<ProfileChangeRequest> getMyRequests(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        return profileChangeRepo.findByEmployeeIdOrderByDateSoumissionDesc(employee.getId());
    }

    public List<ProfileChangeRequest> getPendingRequests() {
        return profileChangeRepo.findByStatutOrderByDateSoumissionAsc(ProfileChangeStatus.EN_ATTENTE);
    }

    public ProfileChangeRequest submitRequest(String email, ProfileChangeRequestDto requestDto) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        // Validate that no forbidden fields (cin, dateNaissance) are being modified and phone is valid
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> updates = mapper.readValue(requestDto.getChampsModifies(), 
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
            if (updates.containsKey("cin") || updates.containsKey("dateNaissance")) {
                throw new IllegalArgumentException("La modification du CIN et de la date de naissance n'est pas autorisée.");
            }
            if (updates.containsKey("telephone")) {
                String phone = (String) updates.get("telephone");
                if (phone != null && !phone.trim().isEmpty()) {
                    String normalized = phone.replaceAll("[\\s\\.\\-\\(\\)]", "");
                    if (!normalized.matches("^(?:0|\\+212|00212)[567]\\d{8}$")) {
                        throw new IllegalArgumentException("Le numéro de téléphone est invalide. Veuillez utiliser un format marocain valide (ex: 0612345678 ou +212612345678).");
                    }
                }
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Format de champs modifiés invalide");
        }

        ProfileChangeRequest request = ProfileChangeRequest.builder()
                .employee(employee)
                .champsModifies(requestDto.getChampsModifies())
                .statut(ProfileChangeStatus.EN_ATTENTE)
                .build();

        ProfileChangeRequest savedRequest = profileChangeRepo.save(request);

        auditService.logAction("SUBMIT_PROFILE_CHANGE", "ProfileChangeRequest", savedRequest.getId(), null, java.util.Map.of(
            "id", savedRequest.getId(),
            "employeeId", savedRequest.getEmployee().getId(),
            "employeeName", savedRequest.getEmployee().getNomComplet(),
            "champsModifies", savedRequest.getChampsModifies(),
            "statut", savedRequest.getStatut().toString()
        ));

        // Notify RH users
        List<User> rhs = userRepository.findByRole(Role.RH);
        for (User rh : rhs) {
            notificationService.createNotification(
                    rh,
                    user,
                    TypeNotification.PROFILE_CHANGE_SUBMITTED,
                    "Nouvelle demande de modification de profil de " + employee.getNomComplet(),
                    savedRequest.getId(),
                    "PROFILE_CHANGE"
            );
        }

        // Notify OWNER users
        List<User> owners = userRepository.findByRole(Role.OWNER);
        for (User owner : owners) {
            notificationService.createNotification(
                    owner,
                    user,
                    TypeNotification.PROFILE_CHANGE_SUBMITTED,
                    "Nouvelle demande de modification de profil de " + employee.getNomComplet(),
                    savedRequest.getId(),
                    "PROFILE_CHANGE"
            );
        }

        return savedRequest;
    }

    @Transactional
    public ProfileChangeRequest processRequest(Long requestId, String rhEmail, boolean approve, String comment) {
        User rhUser = userRepository.findByCourriel(rhEmail)
                .orElseThrow(() -> new ResourceNotFoundException("RH introuvable"));

        ProfileChangeRequest request = profileChangeRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable"));

        if (request.getEmployee() != null && request.getEmployee().getUser() != null 
                && request.getEmployee().getUser().getRole() == ma.newdev.rh.entity.Role.OWNER) {
            throw new UnauthorizedException("Les modifications de profil du propriétaire ne peuvent pas être traitées.");
        }

        if (request.getStatut() != ProfileChangeStatus.EN_ATTENTE) {
            throw new IllegalStateException("Cette demande a déjà été traitée");
        }

        if (!approve && (comment == null || comment.trim().isEmpty())) {
            throw new IllegalArgumentException("Un commentaire est obligatoire pour refuser une demande de modification de profil.");
        }

        java.util.Map<String, Object> oldState = java.util.Map.of(
            "id", request.getId(),
            "employeeId", request.getEmployee() != null ? request.getEmployee().getId() : -1,
            "statut", request.getStatut().toString(),
            "champsModifies", request.getChampsModifies() != null ? request.getChampsModifies() : ""
        );

        request.setStatut(approve ? ProfileChangeStatus.APPROUVE : ProfileChangeStatus.REFUSE);
        request.setCommentaireRh(comment);
        request.setVerificateur(rhUser);
        request.setDateDecision(LocalDateTime.now());

        if (approve) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<String, String> updates = mapper.readValue(request.getChampsModifies(), 
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {});
                
                Employee employee = request.getEmployee();
                if (updates.containsKey("email")) {
                    employee.setEmail(updates.get("email"));
                }
                if (updates.containsKey("telephone")) {
                    employee.setTelephone(updates.get("telephone"));
                }
                if (updates.containsKey("cin")) {
                    employee.setCin(updates.get("cin"));
                }
                if (updates.containsKey("dateNaissance")) {
                    String dob = updates.get("dateNaissance");
                    if (dob != null && !dob.trim().isEmpty() && !dob.equals("—")) {
                        employee.setDateNaissance(java.time.LocalDate.parse(dob));
                    }
                }
                if (updates.containsKey("adresse")) {
                    employee.setAdresse(updates.get("adresse"));
                }
                employeeRepository.save(employee);
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la mise à jour du profil de l'employé : " + e.getMessage(), e);
            }
        }

        ProfileChangeRequest savedRequest = profileChangeRepo.save(request);

        java.util.Map<String, Object> newState = java.util.Map.of(
            "id", savedRequest.getId(),
            "employeeId", savedRequest.getEmployee() != null ? savedRequest.getEmployee().getId() : -1,
            "statut", savedRequest.getStatut().toString(),
            "commentaireRh", savedRequest.getCommentaireRh() != null ? savedRequest.getCommentaireRh() : ""
        );

        auditService.logAction(
            approve ? "APPROVE_PROFILE_CHANGE" : "REJECT_PROFILE_CHANGE",
            "ProfileChangeRequest",
            savedRequest.getId(),
            oldState,
            newState
        );

        // Notify Employee
        notificationService.createNotification(
                request.getEmployee().getUser(),
                rhUser,
                approve ? TypeNotification.PROFILE_CHANGE_APPROVED : TypeNotification.PROFILE_CHANGE_REJECTED,
                "Votre demande de modification de profil a été " + (approve ? "approuvée" : "refusée"),
                savedRequest.getId(),
                "PROFILE_CHANGE"
        );

        return savedRequest;
    }
}
