package ma.newdev.rh.repository;

import ma.newdev.rh.entity.Asset;
import ma.newdev.rh.entity.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByReference(String reference);
    List<Asset> findByStatut(AssetStatus statut);
}
