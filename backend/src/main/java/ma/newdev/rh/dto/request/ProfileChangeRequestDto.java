package ma.newdev.rh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileChangeRequestDto {
    @NotBlank(message = "Les champs modifiés sont obligatoires (format JSON)")
    private String champsModifies;
}
