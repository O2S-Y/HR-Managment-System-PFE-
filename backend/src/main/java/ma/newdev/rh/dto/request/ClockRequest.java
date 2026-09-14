package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClockRequest {
    @NotBlank(message = "Le type de pointage est obligatoire (ARRIVEE ou SORTIE)")
    private String type; // ARRIVEE or SORTIE
    
    private String commentaire;
}
