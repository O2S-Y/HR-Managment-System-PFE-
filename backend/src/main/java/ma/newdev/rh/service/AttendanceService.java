package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ClockRequest;
import ma.newdev.rh.entity.Attendance;
import ma.newdev.rh.entity.AttendanceSource;
import ma.newdev.rh.entity.Employee;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.repository.AttendanceRepository;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Value("${app.attendance.start-time:08:00}")
    private String startTimeStr;

    @Value("${app.attendance.end-time:18:00}")
    private String endTimeStr;

    @Transactional
    public void autoCloseAllPendingAttendances() {
        LocalDate today = LocalDate.now();
        LocalTime endTime = LocalTime.parse(endTimeStr);
        LocalTime now = LocalTime.now();

        List<Attendance> incomplete = attendanceRepository.findByHeureArriveeIsNotNullAndHeureSortieIsNull();
        for (Attendance att : incomplete) {
            if (att.getDatePointage().isBefore(today) || (att.getDatePointage().equals(today) && now.isAfter(endTime))) {
                att.setHeureSortie(endTime);
                att.setCommentaire(att.getCommentaire() == null || att.getCommentaire().trim().isEmpty() 
                        ? "Sortie automatique (oubli)" 
                        : att.getCommentaire() + " [Sortie automatique (oubli)]");
                attendanceRepository.save(att);
            }
        }
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 * * * ?") // runs every hour
    @Transactional
    public void scheduledAutoClose() {
        autoCloseAllPendingAttendances();
    }

    @Transactional
    public List<Attendance> getMyAttendance(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        autoCloseAllPendingAttendances();

        return attendanceRepository.findByEmployeeIdOrderByDatePointageDesc(employee.getId());
    }

    @Transactional
    public List<Attendance> getAllAttendance() {
        autoCloseAllPendingAttendances();
        return attendanceRepository.findAll();
    }

    @Transactional
    public Attendance clock(String email, ClockRequest request) {
        autoCloseAllPendingAttendances();
        
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        LocalTime now = LocalTime.now();
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);
        if (now.isBefore(startTime) || now.isAfter(endTime)) {
            throw new IllegalArgumentException("Le pointage n'est pas autorisé en dehors des heures de travail (" + startTimeStr + " - " + endTimeStr + ")");
        }

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDatePointage(employee.getId(), today)
                .orElse(Attendance.builder()
                        .employee(employee)
                        .datePointage(today)
                        .sourcePointage(AttendanceSource.EMPLOYE)
                        .build());

        if ("ARRIVEE".equalsIgnoreCase(request.getType())) {
            if (attendance.getHeureArrivee() != null) {
                throw new IllegalArgumentException("Pointage d'arrivée déjà enregistré pour aujourd'hui");
            }
            attendance.setHeureArrivee(now);
        } else if ("SORTIE".equalsIgnoreCase(request.getType())) {
            if (attendance.getHeureArrivee() == null) {
                throw new IllegalArgumentException("Veuillez d'abord pointer votre arrivée");
            }
            if (attendance.getHeureSortie() != null) {
                throw new IllegalArgumentException("Pointage de sortie déjà enregistré pour aujourd'hui");
            }
            attendance.setHeureSortie(now);
        } else {
            throw new IllegalArgumentException("Type de pointage invalide. Utilisez ARRIVEE ou SORTIE");
        }

        if (request.getCommentaire() != null && !request.getCommentaire().isEmpty()) {
            attendance.setCommentaire(request.getCommentaire());
        }

        return attendanceRepository.save(attendance);
    }
}
