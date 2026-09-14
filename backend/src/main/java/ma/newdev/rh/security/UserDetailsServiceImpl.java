package ma.newdev.rh.security;

import lombok.RequiredArgsConstructor;
import ma.newdev.rh.entity.User;
import ma.newdev.rh.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String courriel) throws UsernameNotFoundException {
        User user = userRepository.findByCourriel(courriel)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec le courriel : " + courriel));

        return UserDetailsImpl.build(user);
    }
}
