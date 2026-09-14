package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.LeaveProcessDto;
import ma.newdev.rh.dto.request.LeaveRequestDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.LeaveRequest;
import ma.newdev.rh.entity.LeaveType;
import ma.newdev.rh.repository.LeaveTypeRepository;
import ma.newdev.rh.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;
    private final LeaveTypeRepository leaveTypeRepository;

    @GetMapping("/types")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<LeaveType>>> getActiveLeaveTypes() {
        return ResponseEntity.ok(ApiResponse.<List<LeaveType>>builder()
                .success(true)
                .message("Types de congés actifs récupérés")
                .data(leaveTypeRepository.findByActifTrueOrderByNomAsc())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'OWNER')")
    public ResponseEntity<ApiResponse<LeaveRequest>> submitLeaveRequest(
            @Valid @RequestBody LeaveRequestDto requestDto,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<LeaveRequest>builder()
                .success(true)
                .message("Demande de congé soumise avec succès")
                .data(leaveService.submitLeaveRequest(authentication.getName(), requestDto))
                .build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getMyLeaves(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<LeaveRequest>>builder()
                .success(true)
                .message("Historique des congés récupéré")
                .data(leaveService.getMyLeaves(authentication.getName()))
                .build());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getPendingLeaves() {
        return ResponseEntity.ok(ApiResponse.<List<LeaveRequest>>builder()
                .success(true)
                .message("Demandes de congés en attente récupérées")
                .data(leaveService.getPendingLeaves())
                .build());
    }

    @PatchMapping("/{id}/process")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<LeaveRequest>> processLeaveRequest(
            @PathVariable Long id,
            @Valid @RequestBody LeaveProcessDto processDto,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<LeaveRequest>builder()
                .success(true)
                .message(Boolean.TRUE.equals(processDto.getApprove()) ? "Congé approuvé" : "Congé refusé")
                .data(leaveService.processLeaveRequest(id, authentication.getName(), processDto))
                .build());
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH')")
    public ResponseEntity<ApiResponse<LeaveRequest>> cancelLeaveRequest(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<LeaveRequest>builder()
                .success(true)
                .message("Demande de congé annulée")
                .data(leaveService.cancelLeaveRequest(id, authentication.getName()))
                .build());
    }
}
