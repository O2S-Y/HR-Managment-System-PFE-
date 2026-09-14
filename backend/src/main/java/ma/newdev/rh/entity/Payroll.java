package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @Column(name = "mois", nullable = false)
    private Integer mois;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    @Column(name = "salaire_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal salaireBase;

    @Column(name = "primes", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal primes = BigDecimal.ZERO;

    @Column(name = "deductions", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(name = "cnss", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cnss = BigDecimal.ZERO;

    @Column(name = "amo", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amo = BigDecimal.ZERO;

    @Column(name = "ir", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal ir = BigDecimal.ZERO;

    @Column(name = "cimr", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cimr = BigDecimal.ZERO;

    @Column(name = "autres_deductions", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal autresDeductions = BigDecimal.ZERO;

    @Column(name = "salaire_net", nullable = false, precision = 10, scale = 2)
    private BigDecimal salaireNet;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private PayrollStatus statut = PayrollStatus.BROUILLON;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rh_valideur")
    private User valideur;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;
}
