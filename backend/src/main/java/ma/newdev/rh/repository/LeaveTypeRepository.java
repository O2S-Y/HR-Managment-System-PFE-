package ma.newdev.rh.repository;

import ma.newdev.rh.entity.CategorieConge;
import ma.newdev.rh.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {

    List<LeaveType> findByActifTrueOrderByNomAsc();

    Optional<LeaveType> findFirstByCategorie(CategorieConge categorie);

    boolean existsByNom(String nom);
}
