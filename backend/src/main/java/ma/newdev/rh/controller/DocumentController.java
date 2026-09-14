package ma.newdev.rh.controller;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.dto.response.EmployeeResponse;
import ma.newdev.rh.entity.DocumentType;
import ma.newdev.rh.entity.HrDocument;
import ma.newdev.rh.service.EmployeeService;
import ma.newdev.rh.service.HrDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final HrDocumentService hrDocumentService;
    private final EmployeeService employeeService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<HrDocument>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("typeDocument") DocumentType typeDocument,
            Authentication authentication) throws IOException {

        HrDocument doc = hrDocumentService.uploadDocument(file, employeeId, typeDocument, authentication.getName());
        return ResponseEntity.ok(ApiResponse.<HrDocument>builder()
                .success(true)
                .message("Document téléversé avec succès")
                .data(doc)
                .build());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('RH', 'OWNER', 'EMPLOYE')")
    public ResponseEntity<ApiResponse<List<HrDocument>>> getDocumentsByEmployee(
            @PathVariable Long employeeId,
            Authentication authentication) {

        // Safety check for EMPLOYE: can only view their own documents
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYE"))) {
            EmployeeResponse profile = employeeService.getMyProfile(authentication.getName());
            if (!profile.getId().equals(employeeId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(ApiResponse.<List<HrDocument>>builder()
                .success(true)
                .message("Documents récupérés avec succès")
                .data(hrDocumentService.getDocumentsByEmployee(employeeId))
                .build());
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('RH', 'OWNER', 'EMPLOYE')")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            Authentication authentication) {

        HrDocument doc = hrDocumentService.getDocumentById(id);

        // Safety check for EMPLOYE: can only download their own documents
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYE"))) {
            EmployeeResponse profile = employeeService.getMyProfile(authentication.getName());
            if (!profile.getId().equals(doc.getEmployee().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        try {
            Path filePath = Paths.get(doc.getCheminFichier());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String originalName = doc.getNomFichierOriginal();
                // Replace characters that might break Content-Disposition header
                String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(doc.getTypeMime()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RH')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        hrDocumentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Document supprimé avec succès")
                .build());
    }
}
