package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.CreateEmployeeRequest;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.dto.response.EmployeeHistoryResponse;
import ma.newdev.rh.dto.response.EmployeeResponse;
import ma.newdev.rh.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.<List<EmployeeResponse>>builder()
                .success(true)
                .message("Liste des employés récupérée avec succès")
                .data(employeeService.getAllEmployees())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .success(true)
                .message("Détails de l'employé récupérés avec succès")
                .data(employeeService.getEmployeeById(id))
                .build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'OWNER')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .success(true)
                .message("Profil récupéré avec succès")
                .data(employeeService.getMyProfile(authentication.getName()))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .success(true)
                .message("Employé créé avec succès")
                .data(employeeService.createEmployee(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(@PathVariable Long id, @Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .success(true)
                .message("Employé mis à jour avec succès")
                .data(employeeService.updateEmployee(id, request))
                .build());
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<Void>> archiveEmployee(@PathVariable Long id) {
        employeeService.archiveEmployee(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Employé archivé avec succès")
                .build());
    }

    @PatchMapping("/{id}/unarchive")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<Void>> unarchiveEmployee(@PathVariable Long id) {
        employeeService.unarchiveEmployee(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Employé désarchivé avec succès")
                .build());
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<EmployeeHistoryResponse>>> getEmployeeHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<List<EmployeeHistoryResponse>>builder()
                .success(true)
                .message("Historique récupéré avec succès")
                .data(employeeService.getEmployeeHistory(id))
                .build());
    }

    @GetMapping("/me/history")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<EmployeeHistoryResponse>>> getMyEmployeeHistory(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<EmployeeHistoryResponse>>builder()
                .success(true)
                .message("Historique récupéré avec succès")
                .data(employeeService.getMyEmployeeHistory(authentication.getName()))
                .build());
    }
}
