package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class EvaluationDto {
    @NotNull(message = "L'ID de l'employé est obligatoire")
    private Long idEmploye;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotNull(message = "La date d'évaluation est obligatoire")
    private LocalDate dateEvaluation;

    @NotNull(message = "La note globale est obligatoire")
    @DecimalMin(value = "0.0", message = "La note doit être au moins 0")
    @DecimalMax(value = "10.0", message = "La note doit être au maximum 10")
    private BigDecimal noteGlobale;

    private String commentaires;
    private String objectifsAtteints;
    private String axesAmelioration;
    
    @NotBlank(message = "Le statut est obligatoire (BROUILLON ou FINALISE)")
    private String statut;

    private List<ObjectiveScoreDto> objectiveScores;
}
