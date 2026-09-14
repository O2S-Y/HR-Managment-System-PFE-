package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ChangePasswordRequest;
import ma.newdev.rh.dto.request.LoginRequest;
import ma.newdev.rh.dto.request.ResetOwnerPasswordRequest;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.dto.response.JwtResponse;
import ma.newdev.rh.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse jwtResponse = authService.authenticateUser(request);
        return ResponseEntity.ok(ApiResponse.<JwtResponse>builder()
                .success(true)
                .message("Authentification réussie")
                .data(jwtResponse)
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Mot de passe modifié avec succès")
                .build());
    }

    @PostMapping("/owner/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetOwnerPassword(@Valid @RequestBody ResetOwnerPasswordRequest request) {
        authService.resetOwnerPassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Mot de passe propriétaire réinitialisé avec succès")
                .build());
    }
}
