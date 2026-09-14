package ma.newdev.rh.controller;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.dto.response.DashboardStatsDto;
import ma.newdev.rh.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getGlobalStats() {
        return ResponseEntity.ok(ApiResponse.<DashboardStatsDto>builder()
                .success(true)
                .message("Statistiques globales récupérées")
                .data(dashboardService.getGlobalStats())
                .build());
    }
}
