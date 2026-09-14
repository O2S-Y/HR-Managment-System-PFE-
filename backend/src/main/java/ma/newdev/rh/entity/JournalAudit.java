package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "type_entite", nullable = false, length = 100)
    private String typeEntite;

    @Column(name = "id_entite")
    private Long idEntite;

    @Column(name = "ancienne_valeur", columnDefinition = "JSON")
    private String ancienneValeurJson;

    @Column(name = "nouvelle_valeur", columnDefinition = "JSON")
    private String nouvelleValeurJson;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_acteur")
    private User acteur;
}
