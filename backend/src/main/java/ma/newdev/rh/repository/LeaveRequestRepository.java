package ma.newdev.rh.repository;

import ma.newdev.rh.entity.LeaveRequest;
import ma.newdev.rh.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeIdOrderByDateSoumissionDesc(Long employeeId);
    List<LeaveRequest> findByStatutOrderByDateSoumissionAsc(LeaveStatus statut);
}
