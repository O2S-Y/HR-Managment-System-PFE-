package ma.newdev.rh.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ClockRequest;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.Attendance;
import ma.newdev.rh.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/clock")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'OWNER')")
    public ResponseEntity<ApiResponse<Attendance>> clock(
            @Valid @RequestBody ClockRequest request,
            Authentication authentication) {
        
        return ResponseEntity.ok(ApiResponse.<Attendance>builder()
                .success(true)
                .message("Pointage enregistré avec succès")
                .data(attendanceService.clock(authentication.getName(), request))
                .build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getMyAttendance(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<Attendance>>builder()
                .success(true)
                .message("Historique de pointage récupéré")
                .data(attendanceService.getMyAttendance(authentication.getName()))
                .build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendance() {
        return ResponseEntity.ok(ApiResponse.<List<Attendance>>builder()
                .success(true)
                .message("Liste de tous les pointages récupérée")
                .data(attendanceService.getAllAttendance())
                .build());
    }
}
