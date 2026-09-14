package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.PayrollDto;
import ma.newdev.rh.entity.Employee;
import ma.newdev.rh.entity.LeaveRequest;
import ma.newdev.rh.entity.LeaveStatus;
import ma.newdev.rh.entity.CategorieConge;
import ma.newdev.rh.entity.Payroll;
import ma.newdev.rh.entity.PayrollStatus;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.LeaveRequestRepository;
import ma.newdev.rh.repository.PayrollRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AuditService auditService;

    public List<Payroll> getMyPayrolls(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        return payrollRepository.findByEmployeeIdOrderByAnneeDescMoisDesc(employee.getId());
    }

    public List<Payroll> getPayrollsByPeriod(Integer mois, Integer annee) {
        return payrollRepository.findByMoisAndAnnee(mois, annee);
    }

    public Payroll createPayroll(PayrollDto dto) {
        Employee employee = employeeRepository.findById(dto.getIdEmploye())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        BigDecimal cnss = dto.getCnss() != null ? dto.getCnss() : BigDecimal.ZERO;
        BigDecimal amo = dto.getAmo() != null ? dto.getAmo() : BigDecimal.ZERO;
        BigDecimal ir = dto.getIr() != null ? dto.getIr() : BigDecimal.ZERO;
        BigDecimal cimr = dto.getCimr() != null ? dto.getCimr() : BigDecimal.ZERO;
        BigDecimal autres = dto.getAutresDeductions() != null ? dto.getAutresDeductions() : BigDecimal.ZERO;

        BigDecimal totalDeductions = cnss.add(amo).add(ir).add(cimr).add(autres);
        if (dto.getDeductions() != null && dto.getDeductions().compareTo(BigDecimal.ZERO) > 0 && totalDeductions.compareTo(BigDecimal.ZERO) == 0) {
            totalDeductions = dto.getDeductions();
            autres = totalDeductions;
        }

        BigDecimal base = dto.getSalaireBase();
        BigDecimal primes = dto.getPrimes() != null ? dto.getPrimes() : BigDecimal.ZERO;
        BigDecimal net = base.add(primes).subtract(totalDeductions);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .mois(dto.getMois())
                .annee(dto.getAnnee())
                .salaireBase(base)
                .primes(primes)
                .deductions(totalDeductions)
                .cnss(cnss)
                .amo(amo)
                .ir(ir)
                .cimr(cimr)
                .autresDeductions(autres)
                .salaireNet(net)
                .statut(PayrollStatus.BROUILLON)
                .build();

        Payroll savedPayroll = payrollRepository.save(payroll);

        auditService.logAction("CREATE_PAYROLL", "Payroll", savedPayroll.getId(), null, java.util.Map.of(
            "id", savedPayroll.getId(),
            "employeeId", savedPayroll.getEmployee().getId(),
            "employeeName", savedPayroll.getEmployee().getNomComplet(),
            "mois", savedPayroll.getMois(),
            "annee", savedPayroll.getAnnee(),
            "salaireBase", savedPayroll.getSalaireBase(),
            "primes", savedPayroll.getPrimes() != null ? savedPayroll.getPrimes() : 0,
            "deductions", savedPayroll.getDeductions() != null ? savedPayroll.getDeductions() : 0,
            "salaireNet", savedPayroll.getSalaireNet(),
            "statut", savedPayroll.getStatut().toString()
        ));

        return savedPayroll;
    }

    public Payroll validatePayroll(Long id, String rhEmail) {
        User rhUser = userRepository.findByCourriel(rhEmail)
                .orElseThrow(() -> new ResourceNotFoundException("RH introuvable"));

        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fiche de paie introuvable"));

        java.util.Map<String, Object> oldState = java.util.Map.of(
            "id", payroll.getId(),
            "employeeId", payroll.getEmployee().getId(),
            "mois", payroll.getMois(),
            "annee", payroll.getAnnee(),
            "statut", payroll.getStatut().toString()
        );

        payroll.setStatut(PayrollStatus.VALIDE);
        payroll.setValideur(rhUser);

        Payroll savedPayroll = payrollRepository.save(payroll);

        java.util.Map<String, Object> newState = java.util.Map.of(
            "id", savedPayroll.getId(),
            "employeeId", savedPayroll.getEmployee().getId(),
            "mois", savedPayroll.getMois(),
            "annee", savedPayroll.getAnnee(),
            "statut", savedPayroll.getStatut().toString()
        );

        auditService.logAction("VALIDATE_PAYROLL", "Payroll", savedPayroll.getId(), oldState, newState);

        notificationService.createNotification(
                payroll.getEmployee().getUser(),
                rhUser,
                ma.newdev.rh.entity.TypeNotification.PAYSLIP_GENERATED,
                "Votre bulletin de paie " + payroll.getMois() + "/" + payroll.getAnnee() + " est disponible",
                savedPayroll.getId(),
                "PAYROLL"
        );

        return savedPayroll;
    }

    public PayrollDto calculatePayroll(Long idEmploye, Integer mois, Integer annee) {
        Employee employee = employeeRepository.findById(idEmploye)
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        BigDecimal baseSalary = employee.getSalaireBase() != null ? employee.getSalaireBase() : BigDecimal.ZERO;

        BigDecimal dailyRate = baseSalary.divide(BigDecimal.valueOf(26), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal leaveDeduction = BigDecimal.ZERO;

        // 1. Seniority and Leave accrual calculation
        LocalDate monthStart = LocalDate.of(annee, mois, 1);
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

        long totalServiceMonths = java.time.temporal.ChronoUnit.MONTHS.between(employee.getDateEmbauche(), monthEnd);
        boolean isUnderSixMonths = totalServiceMonths < 6;

        // Calculate anniversary-based Year Start for the target period
        LocalDate anniversary = employee.getDateEmbauche().withYear(annee);
        if (monthStart.isBefore(anniversary)) {
            anniversary = anniversary.minusYears(1);
        }
        LocalDate accrualStart = anniversary;

        double accruedBefore = employee.getSoldeCongeAcquis() != null ? employee.getSoldeCongeAcquis() : 21.0;

        // Taken before start of the month in the current employment year
        List<LeaveRequest> allApproved = leaveRequestRepository.findByEmployeeIdOrderByDateSoumissionDesc(idEmploye);
        double takenBefore = 0;
        for (LeaveRequest req : allApproved) {
            if (req.getStatut() == LeaveStatus.APPROUVE && req.getTypeConge() != null
                    && req.getTypeConge().getCategorie() == CategorieConge.ANNUEL) {
                if (!req.getDateDebut().isBefore(accrualStart) && req.getDateDebut().isBefore(monthStart)) {
                    takenBefore += req.getJoursOuvrables();
                }
            }
        }
        double balanceBefore = Math.max(0.0, accruedBefore - takenBefore);

        // 2. Loop through approved leave requests that overlap with the target month
        double annualLeaveDaysInMonth = 0;
        for (LeaveRequest req : allApproved) {
            if (req.getStatut() != LeaveStatus.APPROUVE) {
                continue;
            }

            // Check overlap
            LocalDate start = req.getDateDebut();
            LocalDate end = req.getDateFin();
            LocalDate overlapStart = start.isBefore(monthStart) ? monthStart : start;
            LocalDate overlapEnd = end.isAfter(monthEnd) ? monthEnd : end;

            if (overlapStart.isAfter(overlapEnd)) {
                continue; // no overlap
            }

            // Calculate overlap days (excluding Sundays)
            int overlapDays = 0;
            LocalDate curr = overlapStart;
            while (!curr.isAfter(overlapEnd)) {
                if (curr.getDayOfWeek().getValue() != 7) { // 7 is Sunday
                    overlapDays++;
                }
                curr = curr.plusDays(1);
            }

            if (overlapDays == 0) {
                continue;
            }

            switch (req.getTypeConge().getCategorie()) {
                case ANNUEL:
                    annualLeaveDaysInMonth += overlapDays;
                    break;

                case SANS_SOLDE:
                    // Fully deducted
                    leaveDeduction = leaveDeduction.add(dailyRate.multiply(BigDecimal.valueOf(overlapDays)));
                    break;

                case MALADIE:
                    // First 3 days are paid by employer, subsequent days are unpaid
                    int sicknessWorkDayIndex = 0;
                    int sickDeductedDaysInMonth = 0;
                    LocalDate reqCurr = req.getDateDebut();
                    while (!reqCurr.isAfter(req.getDateFin())) {
                        if (reqCurr.getDayOfWeek().getValue() != 7) {
                            sicknessWorkDayIndex++;
                            // If it falls within target month and is from the 4th day onwards
                            if (sicknessWorkDayIndex > 3 && !reqCurr.isBefore(monthStart) && !reqCurr.isAfter(monthEnd)) {
                                sickDeductedDaysInMonth++;
                            }
                        }
                        reqCurr = reqCurr.plusDays(1);
                    }
                    if (sickDeductedDaysInMonth > 0) {
                        leaveDeduction = leaveDeduction.add(dailyRate.multiply(BigDecimal.valueOf(sickDeductedDaysInMonth)));
                    }
                    break;

                case AUTRE:
                    // Special family leaves or others. Motif checks
                    String motif = req.getCommentaire() != null ? req.getCommentaire().toLowerCase() : "";
                    int limitPaid = 0;
                    if (motif.contains("mariage") || motif.contains("wedding")) {
                        limitPaid = 2; // 4 days allowed, 2 days paid.
                    } else if (motif.contains("naissance") || motif.contains("birth")) {
                        limitPaid = 3;
                    } else if (motif.contains("décès") || motif.contains("deces") || motif.contains("death")) {
                        if (motif.contains("parent") || motif.contains("frere") || motif.contains("soeur") || motif.contains("sibling")) {
                            limitPaid = 2;
                        } else {
                            limitPaid = 3; // spouse or child
                        }
                    } else {
                        // Generic RTT/other: assume fully paid
                        limitPaid = req.getJoursOuvrables();
                    }

                    // Any days exceeding the limitPaid are deducted
                    int familyWorkDayIndex = 0;
                    int familyDeductedDaysInMonth = 0;
                    LocalDate famCurr = req.getDateDebut();
                    while (!famCurr.isAfter(req.getDateFin())) {
                        if (famCurr.getDayOfWeek().getValue() != 7) {
                            familyWorkDayIndex++;
                            if (familyWorkDayIndex > limitPaid && !famCurr.isBefore(monthStart) && !famCurr.isAfter(monthEnd)) {
                                familyDeductedDaysInMonth++;
                            }
                        }
                        famCurr = famCurr.plusDays(1);
                    }
                    if (familyDeductedDaysInMonth > 0) {
                        leaveDeduction = leaveDeduction.add(dailyRate.multiply(BigDecimal.valueOf(familyDeductedDaysInMonth)));
                    }
                    break;

                default:
                    break;
            }
        }

        // Apply annual leave deductions based on seniority (6-month rule) and balance limit
        if (annualLeaveDaysInMonth > 0) {
            double annualDeductedDays = 0;
            if (isUnderSixMonths) {
                // 6-month rule: fully deducted
                annualDeductedDays = annualLeaveDaysInMonth;
            } else if (annualLeaveDaysInMonth > balanceBefore) {
                // Exceeded available balance
                annualDeductedDays = annualLeaveDaysInMonth - Math.max(0, balanceBefore);
            }
            if (annualDeductedDays > 0) {
                leaveDeduction = leaveDeduction.add(dailyRate.multiply(BigDecimal.valueOf(annualDeductedDays)));
            }
        }

        // Calculate seniority prime (Mandatory Moroccan Seniority Premium)
        LocalDate hireDate = employee.getDateEmbauche();
        LocalDate periodEnd = LocalDate.of(annee, mois, 1).plusMonths(1).minusDays(1);
        long yearsOfService = java.time.temporal.ChronoUnit.YEARS.between(hireDate, periodEnd);
        
        BigDecimal seniorityRate = BigDecimal.ZERO;
        if (yearsOfService >= 25) {
            seniorityRate = BigDecimal.valueOf(0.25);
        } else if (yearsOfService >= 20) {
            seniorityRate = BigDecimal.valueOf(0.20);
        } else if (yearsOfService >= 12) {
            seniorityRate = BigDecimal.valueOf(0.15);
        } else if (yearsOfService >= 5) {
            seniorityRate = BigDecimal.valueOf(0.10);
        } else if (yearsOfService >= 2) {
            seniorityRate = BigDecimal.valueOf(0.05);
        }
        
        BigDecimal primeAnciennete = baseSalary.multiply(seniorityRate).setScale(2, java.math.RoundingMode.HALF_UP);

        // 3. Deductions & Net salary calculation
        BigDecimal grossSalary = baseSalary.add(primeAnciennete).subtract(leaveDeduction);
        if (grossSalary.compareTo(BigDecimal.ZERO) < 0) {
            grossSalary = BigDecimal.ZERO;
        }

        // CNSS: 4.48% capped at 6000 MAD
        BigDecimal cnssBase = grossSalary.min(BigDecimal.valueOf(6000));
        BigDecimal cnss = cnssBase.multiply(BigDecimal.valueOf(0.0448)).setScale(2, java.math.RoundingMode.HALF_UP);

        // AMO: 2.26% uncapped
        BigDecimal amo = grossSalary.multiply(BigDecimal.valueOf(0.0226)).setScale(2, java.math.RoundingMode.HALF_UP);

        // CIMR: 0.00 / completely removed as requested
        BigDecimal cimr = BigDecimal.ZERO;

        // Professional Expenses: 20% of Gross capped at 2500 MAD/month
        BigDecimal profExpenses = grossSalary.multiply(BigDecimal.valueOf(0.20))
                .min(BigDecimal.valueOf(2500))
                .setScale(2, java.math.RoundingMode.HALF_UP);

        // Net Taxable Income (SNI) = Gross Salary - CNSS - AMO - Professional Expenses
        BigDecimal sni = grossSalary.subtract(cnss).subtract(amo).subtract(profExpenses);
        if (sni.compareTo(BigDecimal.ZERO) < 0) {
            sni = BigDecimal.ZERO;
        }

        // IR progressive calculation
        double sniVal = sni.doubleValue();
        double irRate = 0.0;
        double irDeduction = 0.0;
        if (sniVal <= 3333) {
            irRate = 0.0;
            irDeduction = 0.0;
        } else if (sniVal <= 5000) {
            irRate = 0.10;
            irDeduction = 333.33;
        } else if (sniVal <= 6667) {
            irRate = 0.20;
            irDeduction = 833.33;
        } else if (sniVal <= 8333) {
            irRate = 0.30;
            irDeduction = 1500.00;
        } else if (sniVal <= 15000) {
            irRate = 0.34;
            irDeduction = 1833.33;
        } else {
            irRate = 0.37;
            irDeduction = 2283.33;
        }

        BigDecimal irRaw = BigDecimal.valueOf(sniVal * irRate - irDeduction).setScale(2, java.math.RoundingMode.HALF_UP);

        // Dependent reduction: 30 MAD per dependent, max 6 dependents (max 180 MAD)
        int numCharges = Math.min(employee.getNombreCharges() != null ? employee.getNombreCharges() : 0, 6);
        BigDecimal chargeReduction = BigDecimal.valueOf(numCharges * 30);
        BigDecimal ir = irRaw.subtract(chargeReduction).max(BigDecimal.ZERO).setScale(2, java.math.RoundingMode.HALF_UP);

        // Total deductions = cnss + amo + ir + leaveDeduction
        BigDecimal totalDeductions = cnss.add(amo).add(ir).add(leaveDeduction).setScale(2, java.math.RoundingMode.HALF_UP);

        PayrollDto dto = new PayrollDto();
        dto.setIdEmploye(idEmploye);
        dto.setMois(mois);
        dto.setAnnee(annee);
        dto.setSalaireBase(baseSalary);
        dto.setPrimes(primeAnciennete);
        dto.setCnss(cnss);
        dto.setAmo(amo);
        dto.setIr(ir);
        dto.setCimr(cimr);
        dto.setAutresDeductions(leaveDeduction);
        dto.setDeductions(totalDeductions);

        return dto;
    }

    @org.springframework.transaction.annotation.Transactional
    public List<Payroll> createBulkPayrolls(ma.newdev.rh.dto.request.BulkPayrollRequest request) {
        java.util.List<Payroll> results = new java.util.ArrayList<>();
        for (Long empId : request.getEmployeeIds()) {
            Employee employee = employeeRepository.findById(empId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable avec l'ID : " + empId));
            
            // Skip OWNER
            if (employee.getUser() != null && employee.getUser().getRole() == ma.newdev.rh.entity.Role.OWNER) {
                continue;
            }

            // Check if payroll already exists for this period
            java.util.Optional<Payroll> existingOpt = payrollRepository.findByEmployeeIdAndMoisAndAnnee(empId, request.getMois(), request.getAnnee());
            if (existingOpt.isPresent()) {
                Payroll existing = existingOpt.get();
                if (existing.getStatut() == PayrollStatus.VALIDE) {
                    continue;
                } else {
                    payrollRepository.delete(existing);
                }
            }

            // Calculate the payroll
            PayrollDto dto = calculatePayroll(empId, request.getMois(), request.getAnnee());
            
            // Create payroll entity
            BigDecimal cnss = dto.getCnss() != null ? dto.getCnss() : BigDecimal.ZERO;
            BigDecimal amo = dto.getAmo() != null ? dto.getAmo() : BigDecimal.ZERO;
            BigDecimal ir = dto.getIr() != null ? dto.getIr() : BigDecimal.ZERO;
            BigDecimal cimr = BigDecimal.ZERO;
            BigDecimal autres = dto.getAutresDeductions() != null ? dto.getAutresDeductions() : BigDecimal.ZERO;

            BigDecimal totalDeductions = cnss.add(amo).add(ir).add(cimr).add(autres);
            BigDecimal base = dto.getSalaireBase();
            BigDecimal primes = dto.getPrimes() != null ? dto.getPrimes() : BigDecimal.ZERO;
            BigDecimal net = base.add(primes).subtract(totalDeductions);

            Payroll payroll = Payroll.builder()
                    .employee(employee)
                    .mois(request.getMois())
                    .annee(request.getAnnee())
                    .salaireBase(base)
                    .primes(primes)
                    .deductions(totalDeductions)
                    .cnss(cnss)
                    .amo(amo)
                    .ir(ir)
                    .cimr(cimr)
                    .autresDeductions(autres)
                    .salaireNet(net)
                    .statut(PayrollStatus.BROUILLON)
                    .build();

            Payroll saved = payrollRepository.save(payroll);
            results.add(saved);

            auditService.logAction("CREATE_PAYROLL", "Payroll", saved.getId(), null, java.util.Map.of(
                "id", saved.getId(),
                "employeeId", saved.getEmployee().getId(),
                "employeeName", saved.getEmployee().getNomComplet(),
                "mois", saved.getMois(),
                "annee", saved.getAnnee(),
                "salaireBase", saved.getSalaireBase(),
                "primes", saved.getPrimes() != null ? saved.getPrimes() : 0,
                "deductions", saved.getDeductions() != null ? saved.getDeductions() : 0,
                "salaireNet", saved.getSalaireNet(),
                "statut", saved.getStatut().toString()
            ));
        }
        return results;
    }
}
