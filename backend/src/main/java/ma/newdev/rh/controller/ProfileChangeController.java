package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ProfileChangeRequestDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.ProfileChangeRequest;
import ma.newdev.rh.service.ProfileChangeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile-changes")
@RequiredArgsConstructor
public class ProfileChangeController {

    private final ProfileChangeService profileChangeService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYE')")
    public ResponseEntity<ApiResponse<ProfileChangeRequest>> submitRequest(
            @Valid @RequestBody ProfileChangeRequestDto requestDto,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<ProfileChangeRequest>builder()
                .success(true)
                .message("Demande de modification soumise avec succès")
                .data(profileChangeService.submitRequest(authentication.getName(), requestDto))
                .build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYE')")
    public ResponseEntity<ApiResponse<List<ProfileChangeRequest>>> getMyRequests(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<ProfileChangeRequest>>builder()
                .success(true)
                .message("Vos demandes récupérées avec succès")
                .data(profileChangeService.getMyRequests(authentication.getName()))
                .build());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<List<ProfileChangeRequest>>> getPendingRequests() {
        return ResponseEntity.ok(ApiResponse.<List<ProfileChangeRequest>>builder()
                .success(true)
                .message("Demandes en attente récupérées")
                .data(profileChangeService.getPendingRequests())
                .build());
    }

    @PatchMapping("/{id}/process")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<ProfileChangeRequest>> processRequest(
            @PathVariable Long id,
            @RequestParam boolean approve,
            @RequestParam(required = false) String comment,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<ProfileChangeRequest>builder()
                .success(true)
                .message(approve ? "Demande approuvée" : "Demande refusée")
                .data(profileChangeService.processRequest(id, authentication.getName(), approve, comment))
                .build());
    }
}
