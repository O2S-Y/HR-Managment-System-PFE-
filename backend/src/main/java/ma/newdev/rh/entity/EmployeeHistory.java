package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @Column(name = "ancien_poste", nullable = false, length = 100)
    private String ancienPoste;

    @Column(name = "nouveau_poste", nullable = false, length = 100)
    private String nouveauPoste;

    @Column(name = "ancien_departement", nullable = false, length = 100)
    private String ancienDepartement;

    @Column(name = "nouveau_departement", nullable = false, length = 100)
    private String nouveauDepartement;

    @Column(name = "motif_changement", length = 500)
    private String motifChangement;

    @CreationTimestamp
    @Column(name = "date_changement", nullable = false, updatable = false)
    private LocalDateTime dateChangement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur_auteur", nullable = false)
    private User auteur;
}
