package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;

    @NotBlank(message = "Le CIN est obligatoire")
    private String cin;

    private String immatriculationCnss;

    @Email(message = "Le format de l'email est invalide")
    private String email;

    private String telephone;

    private LocalDate dateNaissance;

    private String adresse;

    @NotBlank(message = "Le département est obligatoire")
    private String departement;

    @NotBlank(message = "Le poste est obligatoire")
    private String poste;

    @NotBlank(message = "Le type de contrat est obligatoire (CDI, CDD, STAGE, INTERIM)")
    private String typeContrat;

    @NotNull(message = "La date d'embauche est obligatoire")
    private LocalDate dateEmbauche;

    private LocalDate dateFinContrat;

    private String statut;

    private java.math.BigDecimal salaireBase;

    private Double soldeCongeAcquis;

    private Integer nombreCharges;
}
