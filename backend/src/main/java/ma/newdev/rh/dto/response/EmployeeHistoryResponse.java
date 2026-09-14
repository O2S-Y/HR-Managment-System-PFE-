package ma.newdev.rh.dto.response;

import lombok.Builder;
import lombok.Data;
import ma.newdev.rh.entity.EmployeeHistory;

import java.time.LocalDateTime;

@Data
@Builder
public class EmployeeHistoryResponse {
    private Long id;
    private String ancienPoste;
    private String nouveauPoste;
    private String ancienDepartement;
    private String nouveauDepartement;
    private String motifChangement;
    private LocalDateTime dateChangement;
    private String auteurNom;

    public static EmployeeHistoryResponse fromEntity(EmployeeHistory history) {
        if (history == null) return null;

        String auteurNom = "";
        if (history.getAuteur() != null) {
            auteurNom = history.getAuteur().getCourriel();
        }

        return EmployeeHistoryResponse.builder()
                .id(history.getId())
                .ancienPoste(history.getAncienPoste())
                .nouveauPoste(history.getNouveauPoste())
                .ancienDepartement(history.getAncienDepartement())
                .nouveauDepartement(history.getNouveauDepartement())
                .motifChangement(history.getMotifChangement())
                .dateChangement(history.getDateChangement())
                .auteurNom(auteurNom)
                .build();
    }
}
