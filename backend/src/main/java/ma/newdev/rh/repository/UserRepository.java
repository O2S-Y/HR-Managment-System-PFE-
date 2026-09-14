package ma.newdev.rh.repository;

import ma.newdev.rh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByCourriel(String courriel);
    boolean existsByCourriel(String courriel);
    java.util.List<User> findByRole(ma.newdev.rh.entity.Role role);
}
