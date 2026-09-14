package ma.newdev.rh.repository;

import ma.newdev.rh.entity.JournalAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalAuditRepository extends JpaRepository<JournalAudit, Long> {
    List<JournalAudit> findAllByOrderByDateCreationDesc();
}
