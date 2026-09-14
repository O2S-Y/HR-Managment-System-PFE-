package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.CreateUserRequest;
import ma.newdev.rh.entity.Role;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByCourriel(request.getEmail())) {
            throw new IllegalArgumentException("Un utilisateur avec ce courriel existe déjà");
        }

        if (Role.OWNER.name().equals(request.getRole())) {
            throw new UnauthorizedException("Il ne peut y avoir qu'un seul propriétaire. Impossible de créer un autre compte propriétaire.");
        }

        User user = User.builder()
                .courriel(request.getEmail())
                .hashMotDePasse(passwordEncoder.encode(request.getTempPassword()))
                .role(Role.valueOf(request.getRole()))
                .actif(true)
                .doitChangerMotDePasse(true)
                .build();

        return userRepository.save(user);
    }

    public void updateRole(Long id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        if (user.getRole() == Role.OWNER) {
            throw new UnauthorizedException("Le compte propriétaire ne peut pas être modifié.");
        }
        if (Role.OWNER.name().equals(newRole)) {
            throw new UnauthorizedException("Impossible d'attribuer le rôle propriétaire.");
        }
        
        user.setRole(Role.valueOf(newRole));
        userRepository.save(user);
    }

    public void toggleStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        if (user.getRole() == Role.OWNER) {
            throw new UnauthorizedException("Le compte propriétaire ne peut pas être désactivé.");
        }
        
        user.setActif(!user.getActif());
        userRepository.save(user);
    }

    public String resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        if (user.getRole() == Role.OWNER) {
            throw new UnauthorizedException("Le mot de passe du propriétaire ne peut pas être réinitialisé par un autre utilisateur.");
        }
        
        // generate a simple temporary password
        String tempPwd = "Temp" + (1000 + (int)(Math.random() * 9000)) + "!";
        user.setHashMotDePasse(passwordEncoder.encode(tempPwd));
        user.setDoitChangerMotDePasse(true);
        userRepository.save(user);
        
        return tempPwd;
    }
}
