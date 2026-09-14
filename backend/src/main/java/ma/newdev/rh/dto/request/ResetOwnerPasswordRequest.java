package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetOwnerPasswordRequest {
    @NotBlank(message = "La clé de récupération est obligatoire")
    private String recoveryKey;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    private String newPassword;
}
