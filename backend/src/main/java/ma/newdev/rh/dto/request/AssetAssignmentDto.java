package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AssetAssignmentDto {
    @NotNull(message = "L'ID de l'employé est obligatoire")
    private Long idEmploye;

    @NotNull(message = "La date d'affectation est obligatoire")
    private LocalDate dateAffectation;

    private LocalDate dateRetourPrevue;
    private String commentaire;
}
