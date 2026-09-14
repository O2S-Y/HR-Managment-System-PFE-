package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PayrollDto {
    @NotNull(message = "L'ID de l'employé est obligatoire")
    private Long idEmploye;

    @NotNull(message = "Le mois est obligatoire")
    @Min(value = 1, message = "Le mois doit être entre 1 et 12")
    @Max(value = 12, message = "Le mois doit être entre 1 et 12")
    private Integer mois;

    @NotNull(message = "L'année est obligatoire")
    private Integer annee;

    @NotNull(message = "Le salaire de base est obligatoire")
    private BigDecimal salaireBase;

    private BigDecimal primes = BigDecimal.ZERO;
    private BigDecimal deductions = BigDecimal.ZERO;
    private BigDecimal cnss = BigDecimal.ZERO;
    private BigDecimal amo = BigDecimal.ZERO;
    private BigDecimal ir = BigDecimal.ZERO;
    private BigDecimal cimr = BigDecimal.ZERO;
    private BigDecimal autresDeductions = BigDecimal.ZERO;
}
