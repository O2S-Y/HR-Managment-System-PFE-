package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @Column(name = "date_pointage", nullable = false)
    private LocalDate datePointage;

    @Column(name = "heure_arrivee")
    private LocalTime heureArrivee;

    @Column(name = "heure_sortie")
    private LocalTime heureSortie;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_pointage", nullable = false)
    @Builder.Default
    private AttendanceSource sourcePointage = AttendanceSource.EMPLOYE;

    @Column(name = "commentaire", length = 500)
    private String commentaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rh_verificateur")
    private User verificateur;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;
}
