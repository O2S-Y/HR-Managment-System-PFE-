package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkPayrollRequest {
    @NotEmpty(message = "La liste des IDs des employés ne doit pas être vide")
    private List<Long> employeeIds;

    @NotNull(message = "Le mois est obligatoire")
    @Min(value = 1, message = "Le mois doit être entre 1 et 12")
    @Max(value = 12, message = "Le mois doit être entre 1 et 12")
    private Integer mois;

    @NotNull(message = "L'année est obligatoire")
    private Integer annee;
}
