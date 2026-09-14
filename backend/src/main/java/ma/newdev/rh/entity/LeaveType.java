package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leave_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false, length = 100, unique = true)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie", nullable = false)
    private CategorieConge categorie;

    @Column(name = "quota_annuel_jours", nullable = false)
    private Integer quotaAnnuelJours;

    @Column(name = "justification_requise", nullable = false)
    @Builder.Default
    private boolean justificationRequise = false;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private boolean actif = true;
}
