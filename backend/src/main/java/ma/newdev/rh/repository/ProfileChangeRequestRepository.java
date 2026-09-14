package ma.newdev.rh.repository;

import ma.newdev.rh.entity.ProfileChangeRequest;
import ma.newdev.rh.entity.ProfileChangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfileChangeRequestRepository extends JpaRepository<ProfileChangeRequest, Long> {
    List<ProfileChangeRequest> findByEmployeeIdOrderByDateSoumissionDesc(Long employeeId);
    List<ProfileChangeRequest> findByStatutOrderByDateSoumissionAsc(ProfileChangeStatus statut);
}
