package ma.newdev.rh.repository;

import ma.newdev.rh.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    List<LeaveBalance> findByEmployeeIdAndAnnee(Long employeeId, Integer annee);

    Optional<LeaveBalance> findByEmployeeIdAndTypeCongeIdAndAnnee(Long employeeId, Long typeCongeId, Integer annee);
}
