package ma.newdev.rh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {
    private long totalEmployees;
    private long pendingLeaves;
    private long pendingProfileChanges;
    private long availableAssets;
    private long assignedAssets;
    private List<LeaveUsageStats> leaveUsage;
    private List<RecentEvaluationStats> recentEvaluations;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LeaveUsageStats {
        private String month;
        private double value;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentEvaluationStats {
        private Long id;
        private SimpleEmployee employee;
        private SimpleUser evaluateur;
        private String periode;
        private double noteMoyenne;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SimpleEmployee {
        private Long id;
        private String nomComplet;
        private String photoProfil;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SimpleUser {
        private Long id;
        private String courriel;
    }
}
