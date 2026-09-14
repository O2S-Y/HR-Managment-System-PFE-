package ma.newdev.rh.repository;

import ma.newdev.rh.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByDestinataire_IdOrderByDateCreationDesc(Long userId);

    List<Notification> findByDestinataire_IdAndLuFalseOrderByDateCreationDesc(Long userId);

    long countByDestinataire_IdAndLuFalse(Long userId);
}
