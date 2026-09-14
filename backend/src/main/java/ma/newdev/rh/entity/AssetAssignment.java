package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "asset_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AssetAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_actif", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @Column(name = "date_affectation", nullable = false)
    private LocalDate dateAffectation;

    @Column(name = "date_retour_prevue")
    private LocalDate dateRetourPrevue;

    @Column(name = "date_desaffectation")
    private LocalDate dateRetourEffective;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_sortie", nullable = false)
    private AssetCondition etatSortie;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_retour")
    private AssetCondition etatRetour;

    @Column(name = "commentaire", length = 500)
    private String commentaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur_executant", nullable = false)
    private User rhResponsable;
}
