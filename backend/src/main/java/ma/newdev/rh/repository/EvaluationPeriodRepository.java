package ma.newdev.rh.repository;

import ma.newdev.rh.entity.EvaluationPeriod;
import ma.newdev.rh.entity.EvaluationPeriodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationPeriodRepository extends JpaRepository<EvaluationPeriod, Long> {

    List<EvaluationPeriod> findByStatutOrderByDateDebutDesc(EvaluationPeriodStatus statut);

    List<EvaluationPeriod> findAllByOrderByDateDebutDesc();
}
