package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "objective_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ObjectiveScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evaluation", nullable = false)
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_objectif", nullable = false)
    private Objective objectif;

    @Column(name = "note", nullable = false)
    private Integer note;

    @Column(name = "commentaire", nullable = false, columnDefinition = "TEXT")
    private String commentaire;
}
