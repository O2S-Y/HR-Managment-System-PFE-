package ma.newdev.rh.repository;

import ma.newdev.rh.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {
    List<AssetAssignment> findByEmployeeIdOrderByDateAffectationDesc(Long employeeId);
    List<AssetAssignment> findByAssetIdOrderByDateAffectationDesc(Long assetId);
    Optional<AssetAssignment> findByAssetIdAndDateRetourEffectiveIsNull(Long assetId);
}
