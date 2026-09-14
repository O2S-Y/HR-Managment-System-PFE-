package ma.newdev.rh.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import ma.newdev.rh.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    @Getter
    private Long id;

    private String email;

    private String password;

    private boolean active;

    private Collection<? extends GrantedAuthority> authorities;

    @Getter
    private boolean doitChangerMotDePasse;

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return new UserDetailsImpl(
                user.getId(),
                user.getCourriel(),
                user.getHashMotDePasse(),
                user.getActif(),
                authorities,
                user.getDoitChangerMotDePasse() != null ? user.getDoitChangerMotDePasse() : false
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
