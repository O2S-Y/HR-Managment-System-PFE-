package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.EvaluationPeriodDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.EvaluationPeriod;
import ma.newdev.rh.service.EvaluationPeriodService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluation-periods")
@RequiredArgsConstructor
public class EvaluationPeriodController {

    private final EvaluationPeriodService periodService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'OWNER', 'EMPLOYE')")
    public ResponseEntity<ApiResponse<List<EvaluationPeriod>>> getAllPeriods() {
        return ResponseEntity.ok(ApiResponse.<List<EvaluationPeriod>>builder()
                .success(true)
                .message("Périodes d'évaluation récupérées")
                .data(periodService.getAllPeriods())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EvaluationPeriod>> createPeriod(
            @Valid @RequestBody EvaluationPeriodDto requestDto,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<EvaluationPeriod>builder()
                .success(true)
                .message("Période d'évaluation créée avec succès")
                .data(periodService.createPeriod(authentication.getName(), requestDto))
                .build());
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EvaluationPeriod>> closePeriod(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<EvaluationPeriod>builder()
                .success(true)
                .message("Période d'évaluation clôturée")
                .data(periodService.closePeriod(id))
                .build());
    }
}
