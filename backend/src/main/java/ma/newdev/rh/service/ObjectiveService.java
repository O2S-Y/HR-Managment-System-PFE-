package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ObjectiveDto;
import ma.newdev.rh.entity.EvaluationPeriod;
import ma.newdev.rh.entity.Objective;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.repository.EvaluationPeriodRepository;
import ma.newdev.rh.repository.ObjectiveRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ObjectiveService {

    private final ObjectiveRepository objectiveRepository;
    private final EvaluationPeriodRepository periodRepository;

    public List<Objective> getObjectivesByPeriode(Long periodeId) {
        if (!periodRepository.existsById(periodeId)) {
            throw new ResourceNotFoundException("Période d'évaluation introuvable");
        }
        return objectiveRepository.findByPeriodeIdOrderByIdAsc(periodeId);
    }

    public List<Objective> getAllObjectives() {
        return objectiveRepository.findAll();
    }

    public Objective createObjective(ObjectiveDto dto) {
        EvaluationPeriod periode = periodRepository.findById(dto.getIdPeriode())
                .orElseThrow(() -> new ResourceNotFoundException("Période d'évaluation introuvable"));

        // Les objectifs ne peuvent être définis que sur une période ACTIVE.
        if (periode.estCloturee()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible d'ajouter un objectif à une période clôturée.");
        }

        Objective objective = Objective.builder()
                .periode(periode)
                .titre(dto.getTitre())
                .descriptionDetail(dto.getDescriptionDetail())
                .build();

        return objectiveRepository.save(objective);
    }

    public void deleteObjective(Long objectiveId) {
        Objective objective = objectiveRepository.findById(objectiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));

        if (objective.getPeriode().estCloturee()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de supprimer un objectif d'une période clôturée.");
        }

        objectiveRepository.delete(objective);
    }
}
