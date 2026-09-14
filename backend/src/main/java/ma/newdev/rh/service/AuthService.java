package ma.newdev.rh.service;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.dto.request.ChangePasswordRequest;
import ma.newdev.rh.dto.request.LoginRequest;
import ma.newdev.rh.dto.response.JwtResponse;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.exception.ResourceNotFoundException;
import ma.newdev.rh.exception.UnauthorizedException;
import ma.newdev.rh.repository.UserRepository;
import ma.newdev.rh.security.JwtUtils;
import ma.newdev.rh.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final ma.newdev.rh.repository.EmployeeRepository employeeRepository;

    @org.springframework.beans.factory.annotation.Value("${app.owner.recovery-key}")
    private String ownerRecoveryKey;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        String displayName = user.getCourriel();
        java.util.Optional<ma.newdev.rh.entity.Employee> empOpt = employeeRepository.findByUserId(user.getId());
        if (empOpt.isPresent()) {
            displayName = empOpt.get().getNomComplet();
        }

        return JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .name(displayName)
                .email(user.getCourriel())
                .role(user.getRole().name())
                .photoProfil(user.getPhotoProfil())
                .doitChangerMotDePasse(user.getDoitChangerMotDePasse() != null ? user.getDoitChangerMotDePasse() : false)
                .build();
    }

    public void changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        User user = userRepository.findByCourriel(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getHashMotDePasse())) {
            throw new UnauthorizedException("L'ancien mot de passe est incorrect");
        }

        user.setHashMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        user.setDoitChangerMotDePasse(false);
        userRepository.save(user);
    }

    public void resetOwnerPassword(ma.newdev.rh.dto.request.ResetOwnerPasswordRequest request) {
        if (!ownerRecoveryKey.equals(request.getRecoveryKey())) {
            throw new UnauthorizedException("Clé de récupération invalide");
        }

        User owner = userRepository.findByRole(ma.newdev.rh.entity.Role.OWNER).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Compte propriétaire introuvable dans le système"));

        owner.setHashMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(owner);
    }
}
