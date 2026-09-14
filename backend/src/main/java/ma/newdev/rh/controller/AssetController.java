package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.AssetAssignmentDto;
import ma.newdev.rh.dto.request.AssetDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.Asset;
import ma.newdev.rh.entity.AssetAssignment;
import ma.newdev.rh.entity.AssetCondition;
import ma.newdev.rh.service.AssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<Asset>>> getAllAssets() {
        return ResponseEntity.ok(ApiResponse.<List<Asset>>builder()
                .success(true)
                .message("Inventaire du matériel récupéré")
                .data(assetService.getAllAssets())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<Asset>> createAsset(@Valid @RequestBody AssetDto requestDto) {
        return ResponseEntity.ok(ApiResponse.<Asset>builder()
                .success(true)
                .message("Matériel ajouté à l'inventaire")
                .data(assetService.createAsset(requestDto))
                .build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYE')")
    public ResponseEntity<ApiResponse<List<AssetAssignment>>> getMyAssets(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<AssetAssignment>>builder()
                .success(true)
                .message("Vos équipements affectés")
                .data(assetService.getMyAssets(authentication.getName()))
                .build());
    }

    @PostMapping("/{assetId}/assign")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<AssetAssignment>> assignAsset(
            @PathVariable Long assetId,
            @Valid @RequestBody AssetAssignmentDto requestDto,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<AssetAssignment>builder()
                .success(true)
                .message("Matériel affecté avec succès")
                .data(assetService.assignAsset(assetId, authentication.getName(), requestDto))
                .build());
    }

    @PatchMapping("/{assetId}/return")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<AssetAssignment>> returnAsset(
            @PathVariable Long assetId,
            @RequestParam String etatRetour,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<AssetAssignment>builder()
                .success(true)
                .message("Matériel retourné et mis à jour")
                .data(assetService.returnAsset(assetId, AssetCondition.valueOf(etatRetour), authentication.getName()))
                .build());
    }

    @GetMapping("/{assetId}/history")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<AssetAssignment>>> getAssetHistory(@PathVariable Long assetId) {
        return ResponseEntity.ok(ApiResponse.<List<AssetAssignment>>builder()
                .success(true)
                .message("Historique d'affectation récupéré")
                .data(assetService.getAssetHistory(assetId))
                .build());
    }
}
