package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_evenement", nullable = false)
    private TypeNotification typeEvenement;

    @Column(nullable = false, length = 500)
    private String message;

    @Builder.Default
    @Column(nullable = false)
    private boolean lu = false;

    /** Polymorphic reference — ID of the related entity (leave, evaluation, etc.) */
    @Column(name = "id_reference")
    private Long idReference;

    /** Type of the referenced entity (e.g. "LeaveRequest", "Evaluation") */
    @Column(name = "type_reference", length = 50)
    private String typeReference;

    /** The user who RECEIVES this notification */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_destinataire", nullable = false)
    private User destinataire;

    /** The user who triggered the event (optional — system notifications have no sender) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediteur")
    private User expediteur;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;
}
