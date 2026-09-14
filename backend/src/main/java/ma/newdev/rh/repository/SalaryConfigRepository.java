package ma.newdev.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ma.newdev.rh.entity.SalaryConfig;
import java.util.Optional;

@Repository
public interface SalaryConfigRepository extends JpaRepository<SalaryConfig, Long> {
    Optional<SalaryConfig> findFirstByEmployeeIdOrderByDateEffetDesc(Long employeeId);
}
