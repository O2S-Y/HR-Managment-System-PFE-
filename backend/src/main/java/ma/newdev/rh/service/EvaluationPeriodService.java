package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.EvaluationPeriodDto;
import ma.newdev.rh.entity.EvaluationPeriod;
import ma.newdev.rh.entity.EvaluationPeriodStatus;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.repository.EvaluationPeriodRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationPeriodService {

    private final EvaluationPeriodRepository periodRepository;
    private final UserRepository userRepository;

    public List<EvaluationPeriod> getAllPeriods() {
        return periodRepository.findAllByOrderByDateDebutDesc();
    }

    public EvaluationPeriod createPeriod(String ownerEmail, EvaluationPeriodDto dto) {
        User createur = userRepository.findByCourriel(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Créateur introuvable"));

        if (dto.getDateFin().isBefore(dto.getDateDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin doit être postérieure ou égale à la date de début");
        }

        // Invariant métier : une seule période ACTIVE à la fois.
        boolean activeExists = !periodRepository
                .findByStatutOrderByDateDebutDesc(EvaluationPeriodStatus.ACTIVE)
                .isEmpty();
        if (activeExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une période d'évaluation est déjà active. Clôturez-la avant d'en créer une nouvelle.");
        }

        EvaluationPeriod period = EvaluationPeriod.builder()
                .libelle(dto.getLibelle())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .statut(EvaluationPeriodStatus.ACTIVE)
                .createur(createur)
                .build();

        return periodRepository.save(period);
    }

    public EvaluationPeriod closePeriod(Long periodId) {
        EvaluationPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Période d'évaluation introuvable"));

        period.setStatut(EvaluationPeriodStatus.CLOTUREE);
        return periodRepository.save(period);
    }
}
