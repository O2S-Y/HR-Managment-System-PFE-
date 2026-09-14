package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_change_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProfileChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @Column(name = "champs_modifies", nullable = false, columnDefinition = "json")
    private String champsModifies; // Storing JSON as String (can also use JsonNode or custom mapping)

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private ProfileChangeStatus statut = ProfileChangeStatus.EN_ATTENTE;

    @Column(name = "commentaire_rh", length = 500)
    private String commentaireRh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rh_verificateur")
    private User verificateur;

    @CreationTimestamp
    @Column(name = "date_soumission", nullable = false, updatable = false)
    private LocalDateTime dateSoumission;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;
}
