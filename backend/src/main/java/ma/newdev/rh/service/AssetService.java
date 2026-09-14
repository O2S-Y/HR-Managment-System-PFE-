package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.AssetAssignmentDto;
import ma.newdev.rh.dto.request.AssetDto;
import ma.newdev.rh.entity.*;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.repository.AssetAssignmentRepository;
import ma.newdev.rh.repository.AssetRepository;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public List<Asset> getAllAssets() {
        List<Asset> assets = assetRepository.findAll();
        for (Asset asset : assets) {
            if (asset.getStatut() == AssetStatus.ASSIGNE) {
                assignmentRepository.findByAssetIdAndDateRetourEffectiveIsNull(asset.getId())
                        .ifPresent(assignment -> asset.setEmployeeAssigne(assignment.getEmployee()));
            }
        }
        return assets;
    }

    public Asset createAsset(AssetDto dto) {
        if (assetRepository.findByReference(dto.getReference()).isPresent()) {
            throw new IllegalArgumentException("Un actif avec cette référence existe déjà");
        }

        AssetStatus statusVal = AssetStatus.DISPONIBLE;
        if (dto.getStatut() != null) {
            try {
                statusVal = AssetStatus.valueOf(dto.getStatut());
            } catch (IllegalArgumentException e) {
                // Keep default
            }
        }

        Asset asset = Asset.builder()
                .reference(dto.getReference())
                .nom(dto.getNom())
                .categorie(dto.getCategorie())
                .dateAchat(dto.getDateAchat())
                .valeur(dto.getValeur())
                .statut(statusVal)
                .etat(AssetCondition.valueOf(dto.getEtat()))
                .build();

        Asset savedAsset = assetRepository.save(asset);

        auditService.logAction("CREATE_ASSET", "Asset", savedAsset.getId(), null, java.util.Map.of(
            "id", savedAsset.getId(),
            "reference", savedAsset.getReference(),
            "nom", savedAsset.getNom(),
            "categorie", savedAsset.getCategorie(),
            "valeur", savedAsset.getValeur() != null ? savedAsset.getValeur() : 0,
            "statut", savedAsset.getStatut().toString(),
            "etat", savedAsset.getEtat().toString()
        ));

        return savedAsset;
    }

    public List<AssetAssignment> getMyAssets(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        return assignmentRepository.findByEmployeeIdOrderByDateAffectationDesc(employee.getId());
    }

    @Transactional
    public AssetAssignment assignAsset(Long assetId, String rhEmail, AssetAssignmentDto dto) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Actif introuvable"));

        if (asset.getStatut() != AssetStatus.DISPONIBLE) {
            throw new IllegalStateException("Cet actif n'est pas disponible pour affectation");
        }

        Employee employee = employeeRepository.findById(dto.getIdEmploye())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        User rhUser = userRepository.findByCourriel(rhEmail)
                .orElseThrow(() -> new ResourceNotFoundException("RH introuvable"));

        java.util.Map<String, Object> oldAsset = java.util.Map.of(
            "id", asset.getId(),
            "reference", asset.getReference(),
            "nom", asset.getNom(),
            "statut", asset.getStatut().toString()
        );

        AssetAssignment assignment = AssetAssignment.builder()
                .asset(asset)
                .employee(employee)
                .dateAffectation(dto.getDateAffectation())
                .dateRetourPrevue(dto.getDateRetourPrevue())
                .etatSortie(asset.getEtat())
                .commentaire(dto.getCommentaire())
                .rhResponsable(rhUser)
                .build();

        asset.setStatut(AssetStatus.ASSIGNE);
        assetRepository.save(asset);

        AssetAssignment savedAssignment = assignmentRepository.save(assignment);

        java.util.Map<String, Object> newAsset = java.util.Map.of(
            "id", asset.getId(),
            "reference", asset.getReference(),
            "nom", asset.getNom(),
            "statut", asset.getStatut().toString()
        );
        java.util.Map<String, Object> assignmentState = java.util.Map.of(
            "id", savedAssignment.getId(),
            "employeeId", employee.getId(),
            "employeeName", employee.getNomComplet(),
            "dateAffectation", savedAssignment.getDateAffectation().toString()
        );

        auditService.logAction("ASSIGN_ASSET", "Asset", asset.getId(), oldAsset, java.util.Map.of(
            "asset", newAsset,
            "assignment", assignmentState
        ));

        notificationService.createNotification(
                employee.getUser(),
                rhUser,
                TypeNotification.ASSET_ASSIGNED,
                "Un actif vous a été affecté : " + asset.getNom(),
                savedAssignment.getId(),
                "ASSET"
        );

        return savedAssignment;
    }

    @Transactional
    public AssetAssignment returnAsset(Long assetId, AssetCondition etatRetour, String rhEmail) {
        AssetAssignment assignment = assignmentRepository.findByAssetIdAndDateRetourEffectiveIsNull(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune affectation en cours pour cet actif"));

        Asset asset = assignment.getAsset();

        java.util.Map<String, Object> oldAsset = java.util.Map.of(
            "id", asset.getId(),
            "reference", asset.getReference(),
            "nom", asset.getNom(),
            "statut", asset.getStatut().toString(),
            "etat", asset.getEtat().toString()
        );

        assignment.setDateRetourEffective(LocalDate.now());
        assignment.setEtatRetour(etatRetour);

        asset.setStatut(AssetStatus.DISPONIBLE);
        asset.setEtat(etatRetour);
        assetRepository.save(asset);

        User rhUser = userRepository.findByCourriel(rhEmail)
                .orElseThrow(() -> new ResourceNotFoundException("RH introuvable"));

        AssetAssignment savedAssignment = assignmentRepository.save(assignment);

        java.util.Map<String, Object> newAsset = java.util.Map.of(
            "id", asset.getId(),
            "reference", asset.getReference(),
            "nom", asset.getNom(),
            "statut", asset.getStatut().toString(),
            "etat", asset.getEtat().toString()
        );
        java.util.Map<String, Object> assignmentState = java.util.Map.of(
            "id", savedAssignment.getId(),
            "dateRetourEffective", savedAssignment.getDateRetourEffective().toString(),
            "etatRetour", savedAssignment.getEtatRetour().toString()
        );

        auditService.logAction("RETURN_ASSET", "Asset", asset.getId(), oldAsset, java.util.Map.of(
            "asset", newAsset,
            "assignment", assignmentState
        ));

        notificationService.createNotification(
                assignment.getEmployee().getUser(),
                rhUser,
                TypeNotification.ASSET_RETURNED,
                "L'actif suivant a été restitué : " + asset.getNom(),
                savedAssignment.getId(),
                "ASSET"
        );

        return savedAssignment;
    }

    public List<AssetAssignment> getAssetHistory(Long assetId) {
        return assignmentRepository.findByAssetIdOrderByDateAffectationDesc(assetId);
    }
}
