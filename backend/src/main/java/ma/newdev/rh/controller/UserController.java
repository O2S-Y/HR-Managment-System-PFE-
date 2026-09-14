package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.CreateUserRequest;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RH', 'OWNER')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                .success(true)
                .message("Liste des utilisateurs récupérée avec succès")
                .data(userService.getAllUsers())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true)
                .message("Utilisateur créé avec succès")
                .data(user)
                .build());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateRole(@PathVariable Long id, @RequestParam String role) {
        userService.updateRole(id, role);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Rôle de l'utilisateur modifié avec succès")
                .build());
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        userService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Statut de l'utilisateur modifié avec succès")
                .build());
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long id) {
        String tempPwd = userService.resetPassword(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Mot de passe réinitialisé avec succès")
                .data(tempPwd)
                .build());
    }
}
