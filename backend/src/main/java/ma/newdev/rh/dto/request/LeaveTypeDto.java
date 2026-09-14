package ma.newdev.rh.dto.request;

import lombok.Data;

@Data
public class LeaveTypeDto {
    private Long id;
    private String nom;
    private String categorie;
    private Integer quotaAnnuelJours;
    private Boolean justificationRequise;
    private Boolean actif;
}
