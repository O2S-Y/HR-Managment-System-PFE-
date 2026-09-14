package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ObjectiveDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.Objective;
import ma.newdev.rh.service.ObjectiveService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/objectives")
@RequiredArgsConstructor
public class ObjectiveController {

    private final ObjectiveService objectiveService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'OWNER', 'EMPLOYE')")
    public ResponseEntity<ApiResponse<List<Objective>>> getAllObjectives() {
        return ResponseEntity.ok(ApiResponse.<List<Objective>>builder()
                .success(true)
                .message("Objectifs récupérés")
                .data(objectiveService.getAllObjectives())
                .build());
    }

    @GetMapping("/periode/{periodeId}")
    @PreAuthorize("hasAnyRole('RH', 'OWNER', 'EMPLOYE')")
    public ResponseEntity<ApiResponse<List<Objective>>> getObjectivesByPeriode(@PathVariable Long periodeId) {
        return ResponseEntity.ok(ApiResponse.<List<Objective>>builder()
                .success(true)
                .message("Objectifs de la période récupérés")
                .data(objectiveService.getObjectivesByPeriode(periodeId))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Objective>> createObjective(
            @Valid @RequestBody ObjectiveDto requestDto) {
        return ResponseEntity.ok(ApiResponse.<Objective>builder()
                .success(true)
                .message("Objectif créé avec succès")
                .data(objectiveService.createObjective(requestDto))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteObjective(@PathVariable Long id) {
        objectiveService.deleteObjective(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Objectif supprimé avec succès")
                .build());
    }
}
