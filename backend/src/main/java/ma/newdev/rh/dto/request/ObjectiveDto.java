package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ObjectiveDto {

    @NotNull(message = "L'identifiant de la période est obligatoire")
    private Long idPeriode;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String descriptionDetail;
}
