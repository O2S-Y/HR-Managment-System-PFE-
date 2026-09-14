package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.CreateEmployeeRequest;
import ma.newdev.rh.dto.response.EmployeeHistoryResponse;
import ma.newdev.rh.dto.response.EmployeeResponse;
import ma.newdev.rh.entity.*;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.EmployeeHistoryRepository;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;
    private final ma.newdev.rh.repository.LeaveRequestRepository leaveRequestRepository;
    private final ma.newdev.rh.repository.LeaveTypeRepository leaveTypeRepository;
    private final AuditService auditService;

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'ID : " + id));
        return convertToResponse(emp);
    }

    public EmployeeResponse getMyProfile(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Employee emp = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profil employé non trouvé"));

        return convertToResponse(emp);
    }

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        validateBirthDate(request.getDateNaissance());
        validatePhoneNumber(request.getTelephone());

        if (employeeRepository.existsByCin(request.getCin())) {
            throw new IllegalArgumentException("Un employé avec ce CIN existe déjà");
        }

        // 1. Create User account first
        String email = request.getEmail() != null ? request.getEmail() : request.getCin() + "@newdev.ma";
        if (userRepository.existsByCourriel(email)) {
            throw new IllegalArgumentException("Un utilisateur avec ce courriel existe déjà");
        }

        // Temporary password based on CIN
        User user = User.builder()
                .courriel(email)
                .hashMotDePasse(passwordEncoder.encode(request.getCin()))
                .role(Role.EMPLOYE)
                .actif(true)
                .doitChangerMotDePasse(true)
                .build();
        user = userRepository.save(user);

        // 2. Create Employee
        Employee employee = Employee.builder()
                .user(user)
                .nomComplet(request.getNomComplet())
                .cin(request.getCin())
                .immatriculationCnss(request.getImmatriculationCnss())
                .email(email)
                .telephone(request.getTelephone())
                .dateNaissance(request.getDateNaissance())
                .adresse(request.getAdresse())
                .departement(request.getDepartement())
                .poste(request.getPoste())
                .typeContrat(ContractType.valueOf(request.getTypeContrat()))
                .dateEmbauche(request.getDateEmbauche())
                .dateFinContrat(request.getDateFinContrat())
                .statut(EmployeeStatus.ACTIF)
                .salaireBase(request.getSalaireBase() != null ? request.getSalaireBase() : java.math.BigDecimal.ZERO)
                .soldeCongeAcquis(21.0)
                .soldeCongePris(0.0)
                .nombreCharges(request.getNombreCharges() != null ? request.getNombreCharges() : 0)
                .build();

        employee = employeeRepository.save(employee);
        
        // Record History
        recordHistory(employee, "—", employee.getPoste(), "—", employee.getDepartement(), "Création initiale", user);

        EmployeeResponse response = convertToResponse(employee);
        auditService.logAction("CREATE_EMPLOYEE", "Employee", employee.getId(), null, response);

        return response;
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, CreateEmployeeRequest request) {
        validateBirthDate(request.getDateNaissance());
        validatePhoneNumber(request.getTelephone());

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'ID : " + id));

        if (employee.getUser() != null && employee.getUser().getRole() == Role.OWNER) {
            throw new UnauthorizedException("Le profil du propriétaire ne peut pas être modifié.");
        }

        if (!employee.getCin().equals(request.getCin()) && employeeRepository.existsByCin(request.getCin())) {
            throw new IllegalArgumentException("Un employé avec ce CIN existe déjà");
        }

        EmployeeResponse oldState = convertToResponse(employee);

        employee.setNomComplet(request.getNomComplet());
        employee.setCin(request.getCin());
        employee.setImmatriculationCnss(request.getImmatriculationCnss());
        employee.setEmail(request.getEmail());
        employee.setTelephone(request.getTelephone());
        employee.setDateNaissance(request.getDateNaissance());
        employee.setAdresse(request.getAdresse());
        employee.setSalaireBase(request.getSalaireBase() != null ? request.getSalaireBase() : java.math.BigDecimal.ZERO);
        employee.setNombreCharges(request.getNombreCharges() != null ? request.getNombreCharges() : 0);
        if (request.getSoldeCongeAcquis() != null) {
            employee.setSoldeCongeAcquis(request.getSoldeCongeAcquis());
        }
        
        boolean changed = !employee.getPoste().equals(request.getPoste()) || !employee.getDepartement().equals(request.getDepartement());
        String oldPoste = employee.getPoste();
        String oldDept = employee.getDepartement();
        
        employee.setDepartement(request.getDepartement());
        employee.setPoste(request.getPoste());
        employee.setTypeContrat(ContractType.valueOf(request.getTypeContrat()));
        employee.setDateEmbauche(request.getDateEmbauche());
        employee.setDateFinContrat(request.getDateFinContrat());

        if (request.getStatut() != null) {
            EmployeeStatus newStatus = EmployeeStatus.valueOf(request.getStatut());
            employee.setStatut(newStatus);
            
            User user = employee.getUser();
            if (user != null) {
                user.setActif(newStatus == EmployeeStatus.ACTIF);
                userRepository.save(user);
            }
        }

        employee = employeeRepository.save(employee);

        if (changed) {
            String authorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            User author = userRepository.findByCourriel(authorEmail).orElse(null);
            recordHistory(employee, oldPoste, employee.getPoste(), oldDept, employee.getDepartement(), "Mise à jour du poste/département", author);
        }

        EmployeeResponse newState = convertToResponse(employee);
        auditService.logAction("UPDATE_EMPLOYEE", "Employee", employee.getId(), oldState, newState);

        return newState;
    }

    @Transactional
    public void archiveEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        if (employee.getUser() != null && employee.getUser().getRole() == Role.OWNER) {
            throw new UnauthorizedException("Le compte propriétaire ne peut pas être archivé.");
        }

        // Check actor permissions: RH can only archive standard EMPLOYE
        User actor = getCurrentUser();
        if (actor != null && actor.getRole() == Role.RH) {
            if (employee.getUser() != null && employee.getUser().getRole() != Role.EMPLOYE) {
                throw new UnauthorizedException("Un RH ne peut archiver que des comptes employés standards.");
            }
        }

        EmployeeResponse oldState = convertToResponse(employee);

        employee.setStatut(EmployeeStatus.ARCHIVE);
        
        // Deactivate User account
        User user = employee.getUser();
        if (user != null) {
            user.setActif(false);
            userRepository.save(user);
        }
        
        employeeRepository.save(employee);

        EmployeeResponse newState = convertToResponse(employee);
        auditService.logAction("ARCHIVE_EMPLOYEE", "Employee", employee.getId(), oldState, newState);
    }

    @Transactional
    public void unarchiveEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'ID : " + id));

        if (employee.getUser() != null && employee.getUser().getRole() == Role.OWNER) {
            throw new UnauthorizedException("Le compte propriétaire ne peut pas être désarchivé.");
        }

        // Check actor permissions: RH can only unarchive standard EMPLOYE
        User actor = getCurrentUser();
        if (actor != null && actor.getRole() == Role.RH) {
            if (employee.getUser() != null && employee.getUser().getRole() != Role.EMPLOYE) {
                throw new UnauthorizedException("Un RH ne peut désarchiver que des comptes employés standards.");
            }
        }

        EmployeeResponse oldState = convertToResponse(employee);

        employee.setStatut(EmployeeStatus.ACTIF);
        
        // Activate User account
        User user = employee.getUser();
        if (user != null) {
            user.setActif(true);
            userRepository.save(user);
        }
        
        employeeRepository.save(employee);

        EmployeeResponse newState = convertToResponse(employee);
        auditService.logAction("UNARCHIVE_EMPLOYEE", "Employee", employee.getId(), oldState, newState);
    }

    public List<EmployeeHistoryResponse> getEmployeeHistory(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employé introuvable avec l'ID : " + id);
        }
        return historyRepository.findByEmployeeIdOrderByDateChangementDesc(id).stream()
                .map(EmployeeHistoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EmployeeHistoryResponse> getMyEmployeeHistory(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profil employé non trouvé"));
        return getEmployeeHistory(employee.getId());
    }
    
    private void recordHistory(Employee employee, String oldPoste, String newPoste, String oldDept, String newDept, String motif, User auteur) {
        EmployeeHistory history = EmployeeHistory.builder()
                .employee(employee)
                .ancienPoste(oldPoste)
                .nouveauPoste(newPoste)
                .ancienDepartement(oldDept)
                .nouveauDepartement(newDept)
                .motifChangement(motif)
                .auteur(auteur)
                .build();
        historyRepository.save(history);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByCourriel(email).orElse(null);
    }

    private EmployeeResponse convertToResponse(Employee emp) {
        EmployeeResponse resp = EmployeeResponse.fromEntity(emp);
        resp.setSalaireBase(emp.getSalaireBase() != null ? emp.getSalaireBase() : java.math.BigDecimal.ZERO);

        if (emp.getUser() != null && emp.getUser().getRole() == Role.OWNER) {
            resp.setLeaveAcquired(null);
            resp.setLeaveUsed(null);
            resp.setLeaveRemaining(null);
        } else {
            resp.setLeaveAcquired(emp.getSoldeCongeAcquis() != null ? emp.getSoldeCongeAcquis() : 21.0);
            resp.setLeaveUsed(emp.getSoldeCongePris() != null ? emp.getSoldeCongePris() : 0.0);
            resp.setLeaveRemaining(Math.max(0.0, resp.getLeaveAcquired() - resp.getLeaveUsed()));
        }

        return resp;
    }

    private void validateBirthDate(LocalDate dob) {
        if (dob != null) {
            LocalDate minBirthDate = LocalDate.now().minusYears(18);
            if (dob.isAfter(minBirthDate)) {
                throw new IllegalArgumentException("L'employé doit être âgé d'au moins 18 ans.");
            }
        }
    }

    private void validatePhoneNumber(String phone) {
        if (phone != null && !phone.trim().isEmpty()) {
            String normalized = phone.replaceAll("[\\s\\.\\-\\(\\)]", "");
            if (!normalized.matches("^(?:0|\\+212|00212)[567]\\d{8}$")) {
                throw new IllegalArgumentException("Le numéro de téléphone est invalide. Veuillez utiliser un format marocain valide (ex: 0612345678 ou +212612345678).");
            }
        }
    }
}
