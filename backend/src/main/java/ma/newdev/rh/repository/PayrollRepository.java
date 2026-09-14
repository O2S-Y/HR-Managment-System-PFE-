package ma.newdev.rh.repository;

import ma.newdev.rh.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeIdOrderByAnneeDescMoisDesc(Long employeeId);
    List<Payroll> findByMoisAndAnnee(Integer mois, Integer annee);
    java.util.Optional<Payroll> findByEmployeeIdAndMoisAndAnnee(Long employeeId, Integer mois, Integer annee);
}
