package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.entity.DocumentType;
import ma.newdev.rh.entity.Employee;
import ma.newdev.rh.entity.HrDocument;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.HrDocumentRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HrDocumentService {

    private final HrDocumentRepository hrDocumentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // Save files in an "uploads" directory in the project base folder
    private final String uploadDir = "uploads";

    public HrDocument uploadDocument(MultipartFile file, Long employeeId, DocumentType typeDocument, String uploaderEmail) throws IOException {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        if (employee.getUser() != null && employee.getUser().getRole() == ma.newdev.rh.entity.Role.OWNER) {
            throw new UnauthorizedException("Le propriétaire ne peut pas avoir de documents RH gérés par des tiers.");
        }

        User uploader = userRepository.findByCourriel(uploaderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Dépositaire introuvable"));

        // Ensure directory exists
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // Generate unique internal file name to avoid collisions
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "unnamed_file";
        }
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }
        String internalName = UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(uploadDir, internalName);

        // Save file to disk
        Files.copy(file.getInputStream(), targetPath);

        // Save record to DB
        HrDocument document = HrDocument.builder()
                .employee(employee)
                .nomFichierOriginal(originalFilename)
                .nomFichierInterne(internalName)
                .cheminFichier(targetPath.toString())
                .tailleOctets(file.getSize())
                .typeMime(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .typeDocument(typeDocument)
                .deposeur(uploader)
                .build();

        return hrDocumentRepository.save(document);
    }

    public List<HrDocument> getDocumentsByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employé introuvable");
        }
        return hrDocumentRepository.findByEmployeeIdOrderByDateDepotDesc(employeeId);
    }

    public HrDocument getDocumentById(Long documentId) {
        return hrDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));
    }

    public void deleteDocument(Long documentId) {
        HrDocument document = hrDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));

        if (document.getEmployee() != null && document.getEmployee().getUser() != null 
                && document.getEmployee().getUser().getRole() == ma.newdev.rh.entity.Role.OWNER) {
            throw new UnauthorizedException("Le propriétaire ne peut pas avoir de documents RH gérés par des tiers.");
        }

        // Delete from disk
        try {
            Path filePath = Paths.get(document.getCheminFichier());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file from disk: " + e.getMessage());
        }

        // Delete from DB
        hrDocumentRepository.delete(document);
    }
}
