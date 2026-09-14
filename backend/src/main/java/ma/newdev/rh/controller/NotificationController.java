package ma.newdev.rh.controller;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.response.ApiResponse;
import ma.newdev.rh.entity.Notification;
import ma.newdev.rh.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** Get all notifications for the authenticated user */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        return ResponseEntity.ok(ApiResponse.<List<Notification>>builder()
                .success(true)
                .message("Notifications récupérées avec succès")
                .data(notificationService.getMyNotifications())
                .build());
    }

    /** Get unread count */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.<Map<String, Long>>builder()
                .success(true)
                .data(Map.of("count", count))
                .build());
    }

    /** Mark a single notification as read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<Notification>builder()
                .success(true)
                .message("Notification marquée comme lue")
                .data(notificationService.markAsRead(id))
                .build());
    }

    /** Mark all notifications as read */
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Toutes les notifications marquées comme lues")
                .build());
    }

    /** Send direct notification (RH / OWNER only) */
    @PostMapping("/direct")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<Notification>> sendDirectNotification(
            @RequestBody Map<String, Object> body) {
        Long idDestinataire = Long.valueOf(body.get("idDestinataire").toString());
        String message = body.get("message").toString();
        return ResponseEntity.ok(ApiResponse.<Notification>builder()
                .success(true)
                .message("Message direct envoyé avec succès")
                .data(notificationService.sendDirectNotification(idDestinataire, message))
                .build());
    }

    /** Send direct notification to multiple target users (RH / OWNER only) */
    @PostMapping("/send-bulk")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<Void>> sendBulkNotifications(
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<?> recipientIdsRaw = (List<?>) body.get("recipientIds");
        List<Long> recipientIds = recipientIdsRaw.stream()
                .map(id -> Long.valueOf(id.toString()))
                .collect(java.util.stream.Collectors.toList());
        String message = body.get("message").toString();
        notificationService.sendBulkNotifications(recipientIds, message);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Message envoyé avec succès aux destinataires sélectionnés")
                .build());
    }

    /** Broadcast announcement to all users (RH / OWNER only) */
    @PostMapping("/broadcast")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('RH', 'OWNER')")
    public ResponseEntity<ApiResponse<Void>> broadcastAnnouncement(
            @RequestBody Map<String, Object> body) {
        String message = body.get("message").toString();
        notificationService.broadcastAnnouncement(message);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Annonce diffusée avec succès")
                .build());
    }
}
