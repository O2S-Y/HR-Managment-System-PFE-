package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeaveProcessDto {
    @NotNull(message = "La décision (approuvé/refusé) est obligatoire")
    private Boolean approve;
    
    private String commentaire;
}
