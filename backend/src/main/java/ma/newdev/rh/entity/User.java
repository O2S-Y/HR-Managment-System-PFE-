package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "courriel", nullable = false, unique = true, length = 150)
    private String courriel;

    @Column(name = "hash_mot_de_passe", nullable = false, length = 72)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String hashMotDePasse;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Column(name = "doit_changer_mot_de_passe", nullable = false)
    @Builder.Default
    private Boolean doitChangerMotDePasse = false;

    @Column(name = "photo_profil", length = 500)
    private String photoProfil;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;
}
