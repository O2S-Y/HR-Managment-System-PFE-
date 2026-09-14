package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.PayrollDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.Payroll;
import ma.newdev.rh.service.PayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH')")
    public ResponseEntity<ApiResponse<List<Payroll>>> getMyPayrolls(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<Payroll>>builder()
                .success(true)
                .message("Vos fiches de paie récupérées avec succès")
                .data(payrollService.getMyPayrolls(authentication.getName()))
                .build());
    }

    @GetMapping("/period")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<Payroll>>> getPayrollsByPeriod(
            @RequestParam Integer mois,
            @RequestParam Integer annee) {
        return ResponseEntity.ok(ApiResponse.<List<Payroll>>builder()
                .success(true)
                .message("Fiches de paie de la période récupérées")
                .data(payrollService.getPayrollsByPeriod(mois, annee))
                .build());
    }

    @GetMapping("/calculate")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<PayrollDto>> calculatePayroll(
            @RequestParam Long idEmploye,
            @RequestParam Integer mois,
            @RequestParam Integer annee) {
        return ResponseEntity.ok(ApiResponse.<PayrollDto>builder()
                .success(true)
                .message("Calcul de la paie simulé")
                .data(payrollService.calculatePayroll(idEmploye, mois, annee))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<Payroll>> createPayroll(@Valid @RequestBody PayrollDto requestDto) {
        return ResponseEntity.ok(ApiResponse.<Payroll>builder()
                .success(true)
                .message("Fiche de paie créée en brouillon")
                .data(payrollService.createPayroll(requestDto))
                .build());
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<List<Payroll>>> createBulkPayrolls(@Valid @RequestBody ma.newdev.rh.dto.request.BulkPayrollRequest requestDto) {
        return ResponseEntity.ok(ApiResponse.<List<Payroll>>builder()
                .success(true)
                .message("Fiches de paie générées en masse avec succès")
                .data(payrollService.createBulkPayrolls(requestDto))
                .build());
    }

    @PatchMapping("/{id}/validate")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<Payroll>> validatePayroll(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<Payroll>builder()
                .success(true)
                .message("Fiche de paie validée avec succès")
                .data(payrollService.validatePayroll(id, authentication.getName()))
                .build());
    }
}
