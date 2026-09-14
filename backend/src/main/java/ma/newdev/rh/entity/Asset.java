package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_serie", nullable = false, unique = true, length = 100)
    private String reference;

    @Column(name = "nom", nullable = false, length = 150)
    private String nom;

    @Column(name = "type_actif", nullable = false, length = 100)
    private String categorie;

    @Column(name = "date_acquisition")
    private LocalDate dateAchat;

    @Column(name = "valeur", precision = 10, scale = 2)
    private BigDecimal valeur;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_actif", nullable = false)
    @Builder.Default
    private AssetStatus statut = AssetStatus.DISPONIBLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat", nullable = false)
    @Builder.Default
    private AssetCondition etat = AssetCondition.BON;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Transient
    private Employee employeeAssigne;
}
