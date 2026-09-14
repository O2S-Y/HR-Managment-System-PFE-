package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    @NotNull(message = "Le type de congé est obligatoire")
    private Long idTypeConge;

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate dateFin;

    @NotNull(message = "Le nombre de jours ouvrables est obligatoire")
    @Min(value = 1, message = "Le nombre de jours doit être d'au moins 1")
    private Integer joursOuvrables;

    private String commentaire;
}
