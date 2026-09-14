package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AssetDto {
    @NotBlank(message = "La référence est obligatoire")
    private String reference;

    @NotBlank(message = "Le nom de l'actif est obligatoire")
    private String nom;

    @NotBlank(message = "La catégorie est obligatoire")
    private String categorie;

    private LocalDate dateAchat;
    private BigDecimal valeur;
    
    @NotBlank(message = "L'état de l'actif est obligatoire (NEUF, BON, USE, DEFECTUEUX)")
    private String etat;

    private String statut;
}
