package ma.newdev.rh.repository;

import ma.newdev.rh.entity.HrDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HrDocumentRepository extends JpaRepository<HrDocument, Long> {
    List<HrDocument> findByEmployeeIdOrderByDateDepotDesc(Long employeeId);
}
