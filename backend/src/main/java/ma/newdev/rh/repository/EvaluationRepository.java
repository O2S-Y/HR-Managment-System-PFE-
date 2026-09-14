package ma.newdev.rh.repository;

import ma.newdev.rh.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByEmployeeIdOrderByDateEvaluationDesc(Long employeeId);
    List<Evaluation> findAllByOrderByDateEvaluationDesc();
}
