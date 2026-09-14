package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank(message = "Le courriel est obligatoire")
    @Email(message = "Le format du courriel est invalide")
    private String email;

    @NotBlank(message = "Le rôle est obligatoire")
    private String role;
    
    @NotBlank(message = "Le mot de passe temporaire est obligatoire")
    private String tempPassword;
}
