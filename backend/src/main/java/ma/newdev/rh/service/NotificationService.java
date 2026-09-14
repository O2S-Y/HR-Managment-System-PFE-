package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.entity.Notification;
import ma.newdev.rh.entity.TypeNotification;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.repository.NotificationRepository;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /** Get all notifications for the currently authenticated user */
    public List<Notification> getMyNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByDestinataire_IdOrderByDateCreationDesc(user.getId());
    }

    /** Count unread notifications for the current user */
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByDestinataire_IdAndLuFalse(user.getId());
    }

    /** Mark a single notification as read */
    public Notification markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable"));
        n.setLu(true);
        return notificationRepository.save(n);
    }

    /** Mark all notifications as read for the current user */
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread = notificationRepository
                .findByDestinataire_IdAndLuFalseOrderByDateCreationDesc(user.getId());
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Create a notification (called internally by other services when an event occurs).
     * Example: when a leave is approved, LeaveService calls this to notify the employee.
     */
    public Notification createNotification(
            User destinataire,
            User expediteur,
            TypeNotification type,
            String message,
            Long referenceId,
            String referenceType
    ) {
        if (destinataire != null && expediteur != null && destinataire.getId().equals(expediteur.getId())) {
            return null;
        }
        Notification n = Notification.builder()
                .destinataire(destinataire)
                .expediteur(expediteur)
                .typeEvenement(type)
                .message(message)
                .idReference(referenceId)
                .typeReference(referenceType)
                .lu(false)
                .build();
        return notificationRepository.save(n);
    }

    /** Send direct notification from current user to a target user */
    public Notification sendDirectNotification(Long idDestinataire, String message) {
        User sender = getCurrentUser();
        User recipient = userRepository.findById(idDestinataire)
                .orElseThrow(() -> new ResourceNotFoundException("Destinataire introuvable"));
        return createNotification(recipient, sender, TypeNotification.ANNOUNCEMENT, message, null, "DIRECT_MESSAGE");
    }

    /** Send direct notification from current user to multiple target users */
    public void sendBulkNotifications(List<Long> recipientIds, String message) {
        User sender = getCurrentUser();
        for (Long idDestinataire : recipientIds) {
            User recipient = userRepository.findById(idDestinataire).orElse(null);
            if (recipient != null && Boolean.TRUE.equals(recipient.getActif()) && !recipient.getId().equals(sender.getId())) {
                createNotification(recipient, sender, TypeNotification.ANNOUNCEMENT, message, null, "BULK_MESSAGE");
            }
        }
    }

    /** Broadcast an announcement to all active users */
    public void broadcastAnnouncement(String message) {
        User sender = getCurrentUser();
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            if (Boolean.TRUE.equals(user.getActif()) && !user.getId().equals(sender.getId())) {
                createNotification(user, sender, TypeNotification.ANNOUNCEMENT, message, null, "BROADCAST");
            }
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByCourriel(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }
}
