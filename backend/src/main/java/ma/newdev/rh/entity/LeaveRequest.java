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
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_type_conge", nullable = false)
    private LeaveType typeConge;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "jours_ouvrables", nullable = false)
    private Integer joursOuvrables;

    @Column(name = "commentaire", length = 1000)
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private LeaveStatus statut = LeaveStatus.EN_ATTENTE;

    @Column(name = "commentaire_decision", length = 1000)
    private String commentaireDecision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur_decideur")
    private User decideur;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @CreationTimestamp
    @Column(name = "date_soumission", nullable = false, updatable = false)
    private LocalDateTime dateSoumission;

    @Column(name = "justification_original_filename")
    private String justificationOriginalFilename;

    @Column(name = "justification_internal_filename")
    private String justificationInternalFilename;
}
