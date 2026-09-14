package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "id_utilisateur", nullable = false, unique = true)
    private User user;

    @Column(name = "nom_complet", nullable = false, length = 150)
    private String nomComplet;

    @Column(name = "cin", nullable = false, unique = true, length = 20)
    private String cin;

    @Column(name = "immatriculation_cnss", length = 30)
    private String immatriculationCnss;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "adresse", length = 500)
    private String adresse;

    @Column(name = "departement", nullable = false, length = 100)
    private String departement;

    @Column(name = "poste", nullable = false, length = 100)
    private String poste;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_contrat", nullable = false)
    private ContractType typeContrat;

    @Column(name = "date_embauche", nullable = false)
    private LocalDate dateEmbauche;

    @Column(name = "date_fin_contrat")
    private LocalDate dateFinContrat;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private EmployeeStatus statut = EmployeeStatus.ACTIF;

    @Column(name = "salaire_base", precision = 12, scale = 2)
    @Builder.Default
    private java.math.BigDecimal salaireBase = java.math.BigDecimal.ZERO;

    @Column(name = "photo_profil", length = 500)
    private String photoProfil;

    @Column(name = "solde_conge_acquis")
    @Builder.Default
    private Double soldeCongeAcquis = 21.0;

    @Column(name = "solde_conge_pris")
    @Builder.Default
    private Double soldeCongePris = 0.0;

    @Column(name = "nombre_charges")
    @Builder.Default
    private Integer nombreCharges = 0;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;
}
