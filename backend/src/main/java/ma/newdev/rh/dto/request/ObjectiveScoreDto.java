package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ObjectiveScoreDto {
    @NotNull(message = "L'ID de l'objectif est obligatoire")
    private Long idObjectif;

    @NotNull(message = "La note de l'objectif est obligatoire")
    private Integer note;

    private String commentaire;
}
