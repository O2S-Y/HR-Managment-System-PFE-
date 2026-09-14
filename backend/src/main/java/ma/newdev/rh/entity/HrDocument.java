package ma.newdev.rh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hr_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_employe", nullable = false)
    private Employee employee;

    @Column(name = "nom_fichier_interne", nullable = false, length = 255)
    private String nomFichierInterne;

    @Column(name = "nom_fichier_original", nullable = false, length = 255)
    private String nomFichierOriginal;

    @Column(name = "chemin_fichier", nullable = false, length = 500)
    private String cheminFichier;

    @Column(name = "taille_octets", nullable = false)
    private Long tailleOctets;

    @Column(name = "type_mime", nullable = false, length = 100)
    private String typeMime;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_document", nullable = false)
    private DocumentType typeDocument;

    @CreationTimestamp
    @Column(name = "date_depot", nullable = false, updatable = false)
    private LocalDateTime dateDepot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur_depot", nullable = false)
    private User deposeur;
}
