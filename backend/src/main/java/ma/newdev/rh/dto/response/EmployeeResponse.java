package ma.newdev.rh.dto.response;

import lombok.Builder;
import lombok.Data;
import ma.newdev.rh.entity.Employee;

import java.time.LocalDate;

@Data
@Builder
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String nomComplet;
    private String cin;
    private String immatriculationCnss;
    private String email;
    private String telephone;
    private LocalDate dateNaissance;
    private String adresse;
    private String departement;
    private String poste;
    private String typeContrat;
    private LocalDate dateEmbauche;
    private LocalDate dateFinContrat;
    private String statut;
    private java.math.BigDecimal salaireBase;
    private String userRole;
    private Double leaveAcquired;
    private Double leaveUsed;
    private Double leaveRemaining;
    private String photoProfil;
    private Integer nombreCharges;

    public static EmployeeResponse fromEntity(Employee employee) {
        if (employee == null) return null;
        
        return EmployeeResponse.builder()
                .id(employee.getId())
                .userId(employee.getUser().getId())
                .nomComplet(employee.getNomComplet())
                .cin(employee.getCin())
                .immatriculationCnss(employee.getImmatriculationCnss())
                .email(employee.getEmail())
                .telephone(employee.getTelephone())
                .dateNaissance(employee.getDateNaissance())
                .adresse(employee.getAdresse())
                .departement(employee.getDepartement())
                .poste(employee.getPoste())
                .typeContrat(employee.getTypeContrat().name())
                .dateEmbauche(employee.getDateEmbauche())
                .dateFinContrat(employee.getDateFinContrat())
                .statut(employee.getStatut().name())
                .salaireBase(employee.getSalaireBase() != null ? employee.getSalaireBase() : java.math.BigDecimal.ZERO)
                .userRole(employee.getUser().getRole().name())
                .leaveAcquired(0.0)
                .leaveUsed(0.0)
                .leaveRemaining(0.0)
                .photoProfil(employee.getPhotoProfil())
                .nombreCharges(employee.getNombreCharges() != null ? employee.getNombreCharges() : 0)
                .build();
    }
}
