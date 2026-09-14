package ma.newdev.rh.controller;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.LeaveTypeDto;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.CategorieConge;
import ma.newdev.rh.entity.Employee;
import ma.newdev.rh.entity.LeaveType;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.LeaveTypeRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaves-admin")
@RequiredArgsConstructor
public class LeaveAdminController {

    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    /* ───────────── Types de congés ───────────── */

    @GetMapping("/types")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<List<LeaveTypeDto>>> getLeaveTypes() {
        List<LeaveTypeDto> list = leaveTypeRepository.findAll().stream()
                .map(this::toTypeDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<LeaveTypeDto>>builder().success(true).data(list).build());
    }

    @PostMapping("/types")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<LeaveTypeDto>> addLeaveType(@RequestBody LeaveTypeDto dto) {
        LeaveType type = LeaveType.builder()
                .nom(dto.getNom())
                .categorie(parseCategorie(dto.getCategorie()))
                .quotaAnnuelJours(dto.getQuotaAnnuelJours() != null ? dto.getQuotaAnnuelJours() : 0)
                .justificationRequise(Boolean.TRUE.equals(dto.getJustificationRequise()))
                .actif(dto.getActif() == null || dto.getActif())
                .build();
        LeaveType saved = leaveTypeRepository.save(type);
        return ResponseEntity.ok(ApiResponse.<LeaveTypeDto>builder().success(true).data(toTypeDto(saved)).build());
    }

    @PatchMapping("/types")
    @PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<LeaveTypeDto>> updateLeaveType(@RequestBody LeaveTypeDto dto) {
        LeaveType type = leaveTypeRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Type de congé introuvable"));
        if (dto.getNom() != null) type.setNom(dto.getNom());
        if (dto.getCategorie() != null) type.setCategorie(parseCategorie(dto.getCategorie()));
        if (dto.getQuotaAnnuelJours() != null) type.setQuotaAnnuelJours(dto.getQuotaAnnuelJours());
        if (dto.getJustificationRequise() != null) type.setJustificationRequise(dto.getJustificationRequise());
        if (dto.getActif() != null) type.setActif(dto.getActif());
        LeaveType saved = leaveTypeRepository.save(type);
        return ResponseEntity.ok(ApiResponse.<LeaveTypeDto>builder().success(true).data(toTypeDto(saved)).build());
    }

    /* ───────────── Helpers ───────────── */

    private LeaveTypeDto toTypeDto(LeaveType t) {
        LeaveTypeDto dto = new LeaveTypeDto();
        dto.setId(t.getId());
        dto.setNom(t.getNom());
        dto.setCategorie(t.getCategorie() != null ? t.getCategorie().name() : null);
        dto.setQuotaAnnuelJours(t.getQuotaAnnuelJours());
        dto.setJustificationRequise(t.isJustificationRequise());
        dto.setActif(t.isActif());
        return dto;
    }

    private CategorieConge parseCategorie(String value) {
        if (value == null) return CategorieConge.AUTRE;
        try {
            return CategorieConge.valueOf(value);
        } catch (IllegalArgumentException e) {
            return CategorieConge.AUTRE;
        }
    }
}
