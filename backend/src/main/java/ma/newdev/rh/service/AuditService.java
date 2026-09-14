package ma.newdev.rh.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.newdev.rh.entity.JournalAudit;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.repository.JournalAuditRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final JournalAuditRepository journalAuditRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logAction(String action, String typeEntite, Long idEntite, Object ancienneValeur, Object nouvelleValeur) {
        String ancienneValeurJson = safeSerialize(ancienneValeur);
        String nouvelleValeurJson = safeSerialize(nouvelleValeur);

        User actor = getCurrentUser();

        JournalAudit audit = JournalAudit.builder()
                .action(action)
                .typeEntite(typeEntite)
                .idEntite(idEntite)
                .ancienneValeurJson(ancienneValeurJson)
                .nouvelleValeurJson(nouvelleValeurJson)
                .acteur(actor)
                .build();

        journalAuditRepository.save(audit);
    }

    public List<JournalAudit> getAllAudits() {
        return journalAuditRepository.findAllByOrderByDateCreationDesc();
    }

    private String safeSerialize(Object value) {
        if (value == null) return null;
        if (value instanceof String) return (String) value;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            log.warn("Failed to serialize audit state: {}", e.getMessage());
            return String.valueOf(value);
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByCourriel(email).orElse(null);
    }
}
