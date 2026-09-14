package ma.newdev.rh.repository;

import ma.newdev.rh.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeIdOrderByDatePointageDesc(Long employeeId);
    Optional<Attendance> findByEmployeeIdAndDatePointage(Long employeeId, LocalDate datePointage);
    List<Attendance> findByHeureArriveeIsNotNullAndHeureSortieIsNull();
}
