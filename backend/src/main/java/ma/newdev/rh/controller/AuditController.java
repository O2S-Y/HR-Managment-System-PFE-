package ma.newdev.rh.controller;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.JournalAudit;
import ma.newdev.rh.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<JournalAudit>>> getAllAudits() {
        return ResponseEntity.ok(ApiResponse.<List<JournalAudit>>builder()
                .success(true)
                .message("Journal d'audit récupéré avec succès")
                .data(auditService.getAllAudits())
                .build());
    }
}
