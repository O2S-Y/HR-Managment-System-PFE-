package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.EvaluationDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.Evaluation;
import ma.newdev.rh.service.EvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Evaluation>> createEvaluation(
            @Valid @RequestBody EvaluationDto requestDto,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<Evaluation>builder()
                .success(true)
                .message("Évaluation créée avec succès")
                .data(evaluationService.createEvaluation(authentication.getName(), requestDto))
                .build());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<Evaluation>>> getEvaluationsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.<List<Evaluation>>builder()
                .success(true)
                .message("Évaluations de l'employé récupérées")
                .data(evaluationService.getEvaluationsByEmployee(employeeId))
                .build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<Evaluation>>> getAllEvaluations() {
        return ResponseEntity.ok(ApiResponse.<List<Evaluation>>builder()
                .success(true)
                .message("Toutes les évaluations ont été récupérées")
                .data(evaluationService.getAllEvaluations())
                .build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYE')")
    public ResponseEntity<ApiResponse<List<Evaluation>>> getMyEvaluations(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<Evaluation>>builder()
                .success(true)
                .message("Vos évaluations ont été récupérées")
                .data(evaluationService.getMyEvaluations(authentication.getName()))
                .build());
    }
}
