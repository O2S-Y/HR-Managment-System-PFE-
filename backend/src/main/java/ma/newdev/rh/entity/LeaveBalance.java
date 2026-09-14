package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "leave_balances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_type_conge", nullable = false)
    private LeaveType typeConge;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    @Column(name = "total_jours", nullable = false, precision = 5, scale = 1)
    private BigDecimal totalJours;

    @Column(name = "jours_utilises", nullable = false, precision = 5, scale = 1)
    @Builder.Default
    private BigDecimal joursUtilises = BigDecimal.ZERO;

    public BigDecimal joursRestants() {
        return totalJours.subtract(joursUtilises);
    }
}
