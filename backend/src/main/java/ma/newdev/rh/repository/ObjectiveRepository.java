package ma.newdev.rh.repository;

import ma.newdev.rh.entity.Objective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObjectiveRepository extends JpaRepository<Objective, Long> {

    List<Objective> findByPeriodeIdOrderByIdAsc(Long periodeId);
}
