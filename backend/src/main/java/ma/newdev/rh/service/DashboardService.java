package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.response.DashboardStatsDto;
import ma.newdev.rh.entity.AssetStatus;
import ma.newdev.rh.entity.LeaveStatus;
import ma.newdev.rh.entity.ProfileChangeStatus;
import ma.newdev.rh.entity.Evaluation;
import ma.newdev.rh.repository.AssetRepository;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.LeaveRequestRepository;
import ma.newdev.rh.repository.ProfileChangeRequestRepository;
import ma.newdev.rh.repository.EvaluationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRepository;
    private final ProfileChangeRequestRepository profileChangeRepo;
    private final AssetRepository assetRepository;
    private final EvaluationRepository evaluationRepository;

    public DashboardStatsDto getGlobalStats() {
        long totalEmployees = employeeRepository.count();
        long pendingLeaves = leaveRepository.findByStatutOrderByDateSoumissionAsc(LeaveStatus.EN_ATTENTE).size();
        long pendingProfileChanges = profileChangeRepo.findByStatutOrderByDateSoumissionAsc(ProfileChangeStatus.EN_ATTENTE).size();
        long availableAssets = assetRepository.findByStatut(AssetStatus.DISPONIBLE).size();
        long assignedAssets = assetRepository.findByStatut(AssetStatus.ASSIGNE).size();

        // Calculate leave usage for the last 6 months
        List<DashboardStatsDto.LeaveUsageStats> leaveUsage = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = today.minusMonths(i);
            int year = monthDate.getYear();
            int monthValue = monthDate.getMonthValue();
            String monthLabel = getMonthLetter(monthValue);
            
            double totalDays = 0;
            List<ma.newdev.rh.entity.LeaveRequest> approvedLeaves = leaveRepository.findByStatutOrderByDateSoumissionAsc(LeaveStatus.APPROUVE);
            for (ma.newdev.rh.entity.LeaveRequest req : approvedLeaves) {
                if (req.getDateDebut() != null && req.getDateDebut().getYear() == year && req.getDateDebut().getMonthValue() == monthValue) {
                    totalDays += req.getJoursOuvrables();
                }
            }
            
            leaveUsage.add(DashboardStatsDto.LeaveUsageStats.builder()
                    .month(monthLabel)
                    .value(totalDays)
                    .build());
        }

        // Fetch top 3 recent evaluations
        List<Evaluation> recentEvals = evaluationRepository.findAllByOrderByDateEvaluationDesc();
        List<DashboardStatsDto.RecentEvaluationStats> recentEvalStats = recentEvals.stream()
                .limit(3)
                .map(ev -> DashboardStatsDto.RecentEvaluationStats.builder()
                        .id(ev.getId())
                        .employee(ev.getEmployee() != null ? DashboardStatsDto.SimpleEmployee.builder()
                                .id(ev.getEmployee().getId())
                                .nomComplet(ev.getEmployee().getNomComplet())
                                .photoProfil(ev.getEmployee().getPhotoProfil())
                                .build() : null)
                        .evaluateur(ev.getEvaluateur() != null ? DashboardStatsDto.SimpleUser.builder()
                                .id(ev.getEvaluateur().getId())
                                .courriel(ev.getEvaluateur().getCourriel())
                                .build() : null)
                        .periode(getQuarterPeriod(ev.getDateEvaluation()))
                        .noteMoyenne(ev.getNoteGlobale() != null ? ev.getNoteGlobale().doubleValue() : 0.0)
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalEmployees(totalEmployees)
                .pendingLeaves(pendingLeaves)
                .pendingProfileChanges(pendingProfileChanges)
                .availableAssets(availableAssets)
                .assignedAssets(assignedAssets)
                .leaveUsage(leaveUsage)
                .recentEvaluations(recentEvalStats)
                .build();
    }

    private String getMonthLetter(int monthValue) {
        switch (monthValue) {
            case 1: return "J";
            case 2: return "F";
            case 3: return "M";
            case 4: return "A";
            case 5: return "M";
            case 6: return "J";
            case 7: return "J";
            case 8: return "A";
            case 9: return "S";
            case 10: return "O";
            case 11: return "N";
            case 12: return "D";
            default: return "";
        }
    }

    private String getQuarterPeriod(LocalDate date) {
        if (date == null) return "—";
        int month = date.getMonthValue();
        int year = date.getYear();
        int quarter = (month - 1) / 3 + 1;
        return "T" + quarter + " " + year;
    }
}
