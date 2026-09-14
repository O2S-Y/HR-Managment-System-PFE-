package ma.newdev.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ma.newdev.rh.entity.*;

@Repository

public interface ObjectiveScoreRepository extends JpaRepository<ObjectiveScore, Long> {
}
