package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.EvaluationDto;
import ma.newdev.rh.entity.Employee;
import ma.newdev.rh.entity.Evaluation;
import ma.newdev.rh.entity.EvaluationStatus;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.repository.EmployeeRepository;
import ma.newdev.rh.repository.EvaluationRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ma.newdev.rh.repository.ObjectiveRepository objectiveRepository;
    private final ma.newdev.rh.repository.ObjectiveScoreRepository objectiveScoreRepository;

    public List<Evaluation> getMyEvaluations(String email) {
        User user = userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employé introuvable"));

        return evaluationRepository.findByEmployeeIdOrderByDateEvaluationDesc(employee.getId());
    }

    public List<Evaluation> getEvaluationsByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employé introuvable");
        }
        return evaluationRepository.findByEmployeeIdOrderByDateEvaluationDesc(employeeId);
    }

    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }

    public Evaluation createEvaluation(String evaluatorEmail, EvaluationDto requestDto) {
        User evaluator = userRepository.findByCourriel(evaluatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluateur introuvable"));

        Employee employee = employeeRepository.findById(requestDto.getIdEmploye())
                .orElseThrow(() -> new ResourceNotFoundException("Employé à évaluer introuvable"));

        Evaluation evaluation = Evaluation.builder()
                .employee(employee)
                .titre(requestDto.getTitre())
                .dateEvaluation(requestDto.getDateEvaluation())
                .noteGlobale(requestDto.getNoteGlobale())
                .commentaires(requestDto.getCommentaires())
                .objectifsAtteints(requestDto.getObjectifsAtteints())
                .axesAmelioration(requestDto.getAxesAmelioration())
                .statut(EvaluationStatus.valueOf(requestDto.getStatut()))
                .evaluateur(evaluator)
                .build();

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);

        if (requestDto.getObjectiveScores() != null) {
            for (ma.newdev.rh.dto.request.ObjectiveScoreDto osDto : requestDto.getObjectiveScores()) {
                ma.newdev.rh.entity.Objective objective = objectiveRepository.findById(osDto.getIdObjectif())
                        .orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable avec l'ID : " + osDto.getIdObjectif()));
                ma.newdev.rh.entity.ObjectiveScore objectiveScore = ma.newdev.rh.entity.ObjectiveScore.builder()
                        .evaluation(savedEvaluation)
                        .objectif(objective)
                        .note(osDto.getNote())
                        .commentaire(osDto.getCommentaire() != null ? osDto.getCommentaire() : "")
                        .build();
                objectiveScoreRepository.save(objectiveScore);
            }
        }

        notificationService.createNotification(
                employee.getUser(),
                evaluator,
                ma.newdev.rh.entity.TypeNotification.EVALUATION_SUBMITTED,
                "Vous avez reçu une nouvelle évaluation : " + requestDto.getTitre(),
                savedEvaluation.getId(),
                "EVALUATION"
        );

        return savedEvaluation;
    }
}
