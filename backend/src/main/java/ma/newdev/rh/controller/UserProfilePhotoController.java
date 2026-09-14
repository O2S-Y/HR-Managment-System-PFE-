package ma.newdev.rh.controller;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.Employee;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.entity.Role;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.UserRepository;
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

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfilePhotoController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    private static final String UPLOAD_DIR = "uploads/profiles";

    @PostMapping("/{userId}/photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        User currentUser = userRepository.findByCourriel(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur actuel introuvable"));

        // Access control: a user can only upload their own photo unless they are RH or OWNER
        if (!currentUser.getId().equals(userId) && currentUser.getRole() == Role.EMPLOYE) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à modifier la photo de cet utilisateur");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur cible introuvable"));

        // Ensure directories exist
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = ".png"; // default
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(UPLOAD_DIR, filename);

        // Copy file
        Files.copy(file.getInputStream(), targetPath);

        // Relative path for client access
        String photoUrl = "/api/users/photo/" + filename;

        // Update database
        targetUser.setPhotoProfil(photoUrl);
        userRepository.save(targetUser);

        employeeRepository.findByUserId(userId).ifPresent(employee -> {
            employee.setPhotoProfil(photoUrl);
            employeeRepository.save(employee);
        });

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Photo de profil mise à jour avec succès")
                .data(photoUrl)
                .build());
    }

    @GetMapping("/photo/{filename:.+}")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/png";
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException e) {
                    // Fallback
                }
                if (contentType == null) {
                    contentType = "image/png";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
