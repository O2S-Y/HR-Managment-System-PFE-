package ma.newdev.rh.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            Number count = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM users").getSingleResult();
            if (count != null && count.longValue() > 0) {
                System.out.println("🌱 Database already has data (found " + count + " users). Skipping database seeding to preserve persistence.");
                return;
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not check users count (database might be empty or uninitialized). Proceeding with initial seeding: " + e.getMessage());
        }

        System.out.println("⏳ Reseeding database with clean Moroccan test data...");
        try {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

            // Truncate all tables
            entityManager.createNativeQuery("TRUNCATE TABLE audit_log").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE notifications").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE payroll").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE salary_configs").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE profile_change_requests").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE attendance").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE asset_assignments").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE assets").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE objective_scores").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE evaluations").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE objectives").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE evaluation_periods").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE leave_requests").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE leave_balances").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE leave_types").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE hr_documents").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE employee_history").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE employees").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE users").executeUpdate();

            // 1. Users (password = "password" for all)
            entityManager.createNativeQuery("INSERT INTO users (id, courriel, hash_mot_de_passe, role, actif, doit_changer_mot_de_passe, date_creation) VALUES " +
                    "(1, 'owner@newdev.ma', '$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy', 'OWNER', TRUE, FALSE, NOW()), " +
                    "(2, 'rh@newdev.ma',    '$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy', 'RH',      TRUE, FALSE, NOW()), " +
                    "(3, 'oussama@newdev.ma','$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy','EMPLOYE', TRUE, FALSE, NOW()), " +
                    "(4, 'anass@newdev.ma',  '$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy','EMPLOYE', TRUE, FALSE, NOW())").executeUpdate();

            // 2. Employees
            entityManager.createNativeQuery("INSERT INTO employees (id, id_utilisateur, nom_complet, cin, immatriculation_cnss, email, telephone, date_naissance, adresse, departement, poste, type_contrat, date_embauche, date_fin_contrat, statut, salaire_base, nombre_charges, date_creation) VALUES " +
                    "(1, 3, 'Oussama Yinssi', 'AB987654', '1234567890', 'oussama@newdev.ma', '0612345678', '1997-10-15', '123 Boulevard d''Anfa, Casablanca', 'Développement', 'Développeur Senior', 'CDI', '2024-09-01', NULL, 'ACTIF', 15000.00, 1, NOW()), " +
                    "(2, 4, 'Anass Yinssi',   'CD123456', '9876543210', 'anass@newdev.ma',   '0655443322', '2000-05-20', '45 Avenue Mohammed V, Rabat',       'Design',        'UX Designer',        'CDD', '2025-11-01', '2026-10-31', 'ACTIF', 9500.00, 0, NOW()), " +
                    "(3, 2, 'Responsable RH', 'RH789012', '9988776655', 'rh@newdev.ma',      '0699999999', '1990-01-01', 'Bureau RH, Casablanca',             'Ressources Humaines', 'DRH',             'CDI', '2023-01-01', NULL, 'ACTIF', 18000.00, 3, NOW())").executeUpdate();

            // 3. Leave Types
            entityManager.createNativeQuery("INSERT INTO leave_types (id, nom, categorie, quota_annuel_jours, justification_requise, actif) VALUES " +
                    "(1, 'Congés payés', 'ANNUEL', 18, FALSE, TRUE), " +
                    "(2, 'Maladie',      'MALADIE', 0, TRUE,  TRUE), " +
                    "(3, 'Mariage',      'AUTRE',   4, TRUE,  TRUE), " +
                    "(4, 'Sans solde',   'SANS_SOLDE', 0, FALSE, TRUE)").executeUpdate();

            // 4. Leave Balances (all fresh — nothing used yet)
            entityManager.createNativeQuery("INSERT INTO leave_balances (id_employe, id_type_conge, annee, total_jours, jours_utilises) VALUES " +
                    "(1, 1, 2026, 18.0, 0.0), " +
                    "(1, 2, 2026,  0.0, 0.0), " +
                    "(1, 3, 2026,  4.0, 0.0), " +
                    "(2, 1, 2026, 18.0, 0.0), " +
                    "(2, 2, 2026,  0.0, 0.0), " +
                    "(2, 3, 2026,  4.0, 0.0), " +
                    "(3, 1, 2026, 18.0, 0.0)").executeUpdate();

            // 5. Salary Configs
            entityManager.createNativeQuery("INSERT INTO salary_configs (id_employe, salaire_base, date_effet, id_rh_createur) VALUES " +
                    "(1, 15000.00, '2024-09-01', 2), " +
                    "(2, 9500.00,  '2025-11-01', 2), " +
                    "(3, 18000.00, '2023-01-01', 2)").executeUpdate();

            // 6. Assets
            entityManager.createNativeQuery("INSERT INTO assets (id, nom, type_actif, numero_serie, date_acquisition, statut_actif, valeur, etat, date_creation) VALUES " +
                    "(1, 'Dell Latitude 7430',      'LAPTOP',    'DL7430-001', '2024-01-15', 'ASSIGNE', 12000.00, 'BON', NOW()), " +
                    "(2, 'MacBook Pro 14\"',         'LAPTOP',    'MBP14-002',  '2024-06-10', 'DISPONIBLE', 25000.00, 'NEUF', NOW()), " +
                    "(3, 'Dell UltraSharp U2723QE', 'MONITOR',   'DUS2723-003', '2024-03-20', 'DISPONIBLE', 6000.00, 'BON', NOW()), " +
                    "(4, 'iPhone 15',               'PHONE',     'IP15-004',   '2024-09-05', 'DISPONIBLE', 10000.00, 'NEUF', NOW())").executeUpdate();

            // 7. Asset Assignments (Dell Laptop assigned to Oussama)
            entityManager.createNativeQuery("INSERT INTO asset_assignments (id_actif, id_employe, date_affectation, date_desaffectation, id_utilisateur_executant) VALUES " +
                    "(1, 1, '2024-09-01 09:00:00', NULL, 2)").executeUpdate();

            // 8. Leave Requests — 1 pending (for live demo), 1 approved, 1 refused
            entityManager.createNativeQuery("INSERT INTO leave_requests (id, id_employe, id_type_conge, date_debut, date_fin, jours_ouvrables, commentaire, statut, date_soumission) VALUES " +
                    "(1, 1, 1, '2026-07-14', '2026-07-18', 5, 'Vacances en famille à Agadir', 'EN_ATTENTE', '2026-06-22 14:30:00')").executeUpdate();

            entityManager.createNativeQuery("INSERT INTO leave_requests (id, id_employe, id_type_conge, date_debut, date_fin, jours_ouvrables, commentaire, statut, commentaire_decision, id_utilisateur_decideur, date_decision, date_soumission) VALUES " +
                    "(2, 1, 1, '2026-05-05', '2026-05-09', 5, 'Repos personnel', 'APPROUVE', 'Bon repos, validé.', 1, '2026-05-02 09:15:00', '2026-05-01 16:00:00'), " +
                    "(3, 2, 3, '2026-06-01', '2026-06-04', 4, 'Événement familial', 'REFUSE', 'Période de forte charge, refusé.', 1, '2026-05-28 10:00:00', '2026-05-26 09:00:00')").executeUpdate();

            // Update leave balances for approved request (Oussama used 5 days)
            entityManager.createNativeQuery("UPDATE leave_balances SET jours_utilises = 5.0 WHERE id_employe = 1 AND id_type_conge = 1 AND annee = 2026").executeUpdate();

            // 9. Attendance (current week — Mon-Tue complete, Wed in progress)
            entityManager.createNativeQuery("INSERT INTO attendance (id_employe, date_pointage, heure_arrivee, heure_sortie, source_pointage, commentaire, id_rh_verificateur, date_creation) VALUES " +
                    "(1, '2026-06-22', '08:45:00', '17:15:00', 'EMPLOYE', NULL, NULL, NOW()), " +
                    "(1, '2026-06-23', '08:30:00', '17:20:00', 'EMPLOYE', NULL, NULL, NOW()), " +
                    "(1, '2026-06-24', '08:50:00', NULL,       'EMPLOYE', NULL, NULL, NOW()), " +
                    "(2, '2026-06-22', '09:00:00', '17:30:00', 'EMPLOYE', NULL, NULL, NOW()), " +
                    "(2, '2026-06-23', '09:10:00', '17:00:00', 'EMPLOYE', NULL, NULL, NOW()), " +
                    "(2, '2026-06-24', '09:05:00', NULL,       'EMPLOYE', NULL, NULL, NOW()), " +
                    "(3, '2026-06-22', '08:30:00', '18:00:00', 'EMPLOYE', NULL, NULL, NOW()), " +
                    "(3, '2026-06-23', '08:25:00', '17:45:00', 'EMPLOYE', NULL, NULL, NOW()), " +
                    "(3, '2026-06-24', '08:35:00', NULL,       'EMPLOYE', NULL, NULL, NOW())").executeUpdate();

            // 10. Evaluation Period
            entityManager.createNativeQuery("INSERT INTO evaluation_periods (id, libelle, date_debut, date_fin, statut, id_utilisateur_createur, date_creation) VALUES " +
                    "(1, 'S1 2026 — Évaluation semestrielle', '2026-01-01', '2026-06-30', 'ACTIVE', 1, NOW())").executeUpdate();

            // 11. Objectives
            entityManager.createNativeQuery("INSERT INTO objectives (id, id_periode_evaluation, titre, description_detail, date_creation) VALUES " +
                    "(1, 1, 'Livraison du module RH', 'Développer et déployer le système de gestion RH complet', NOW()), " +
                    "(2, 1, 'Documentation technique', 'Rédiger les diagrammes UML, le rapport et la documentation API', NOW()), " +
                    "(3, 1, 'Qualité du code', 'Livrer un code propre, testé et bien structuré', NOW())").executeUpdate();

            // 12. Evaluation (Oussama — finalized)
            entityManager.createNativeQuery("INSERT INTO evaluations (id, id_employe, titre, date_evaluation, note_globale, commentaires, objectifs_atteints, axes_amelioration, statut, id_evaluateur, date_creation) VALUES " +
                    "(1, 1, 'S1 2026 — Évaluation semestrielle', '2026-06-20', 4.00, 'Excellent travail sur le projet PFE. Très bonne maîtrise technique.', 'Livraison du module RH, Qualité du code', 'Documentation technique à compléter', 'FINALISE', 1, NOW())").executeUpdate();

            // 13. Objective Scores
            entityManager.createNativeQuery("INSERT INTO objective_scores (id_evaluation, id_objectif, note, commentaire) VALUES " +
                    "(1, 1, 5, 'Module livré dans les délais avec toutes les fonctionnalités'), " +
                    "(1, 2, 3, 'Documentation partielle, à compléter'), " +
                    "(1, 3, 4, 'Code bien structuré et maintenable')").executeUpdate();

            // 14. Profile Change Request (1 pending for RH to approve live)
            entityManager.createNativeQuery("INSERT INTO profile_change_requests (id, id_employe, champs_modifies, statut, commentaire_rh, id_rh_verificateur, date_soumission, date_decision) VALUES " +
                    "(1, 1, '{\"telephone\":\"0661234567\",\"adresse\":\"12 Rue Al Massira, Casablanca\"}', 'EN_ATTENTE', NULL, NULL, '2026-06-23 16:00:00', NULL)").executeUpdate();

            // 15. Payroll (May 2026 — paid)
            entityManager.createNativeQuery("INSERT INTO payroll (id_employe, mois, annee, salaire_base, primes, deductions, cnss, amo, ir, cimr, autres_deductions, salaire_net, statut, date_paiement, id_rh_valideur, date_creation) VALUES " +
                    "(1, 5, 2026, 15000.00, 1000.00, 3200.00, 268.80, 339.00, 2592.20, 0.00, 0.00, 12800.00, 'PAYE', '2026-05-30', 2, NOW()), " +
                    "(2, 5, 2026,  9500.00,    0.00, 1650.00, 268.80, 214.70, 1166.50, 0.00, 0.00,  7850.00, 'PAYE', '2026-05-30', 2, NOW()), " +
                    "(3, 5, 2026, 18000.00,    0.00, 4100.00, 268.80, 406.80, 3424.40, 0.00, 0.00, 13900.00, 'PAYE', '2026-05-30', 2, NOW())").executeUpdate();

            // 16. Employee History
            entityManager.createNativeQuery("INSERT INTO employee_history (id, id_employe, ancien_poste, nouveau_poste, ancien_departement, nouveau_departement, motif_changement, date_changement, id_utilisateur_auteur) VALUES " +
                    "(1, 1, 'Développeur Junior', 'Développeur Senior', 'Développement', 'Développement', 'Promotion suite à d''excellentes performances', '2025-09-01 10:00:00', 2)").executeUpdate();

            // 17. Notifications
            entityManager.createNativeQuery("INSERT INTO notifications (id_destinataire, id_expediteur, type_evenement, message, lu, id_reference, type_reference, date_creation) VALUES " +
                    "(1, 3,    'LEAVE_SUBMITTED',         'Nouvelle demande de congé d''Oussama Yinssi (5 jours — 14/07 au 18/07)', FALSE, 1, 'LeaveRequest', NOW()), " +
                    "(3, 1,    'LEAVE_APPROVED',          'Votre demande de congé du 05/05 au 09/05 a été approuvée',               TRUE,  2, 'LeaveRequest', NOW()), " +
                    "(4, 1,    'LEAVE_REFUSED',           'Votre demande de congé du 01/06 au 04/06 a été refusée',                 TRUE,  3, 'LeaveRequest', NOW()), " +
                    "(3, NULL, 'ASSET_ASSIGNED',          'Un Dell Latitude 7430 vous a été affecté',                                TRUE,  1, 'AssetAssignment', NOW()), " +
                    "(2, 3,    'PROFILE_CHANGE_SUBMITTED','Oussama Yinssi a soumis une demande de modification de profil',           FALSE, 1, 'ProfileChangeRequest', NOW()), " +
                    "(3, 2,    'PAYSLIP_GENERATED',       'Votre bulletin de paie de mai 2026 est disponible',                       FALSE, 1, 'Payslip', NOW()), " +
                    "(4, 2,    'PAYSLIP_GENERATED',       'Votre bulletin de paie de mai 2026 est disponible',                       FALSE, 2, 'Payslip', NOW()), " +
                    "(3, 1,    'ANNOUNCEMENT',           'Soutenance PFE prévue le 25 juin — bonne chance à tous !',                 FALSE, NULL, NULL, NOW()), " +
                    "(4, 1,    'ANNOUNCEMENT',           'Soutenance PFE prévue le 25 juin — bonne chance à tous !',                 FALSE, NULL, NULL, NOW())").executeUpdate();

            // 18. Audit Log
            entityManager.createNativeQuery("INSERT INTO audit_log (id_acteur, action, type_entite, id_entite, ancienne_valeur, nouvelle_valeur, date_creation) VALUES " +
                    "(2, 'CREATE', 'Employee', 1, NULL, '{\"nomComplet\":\"Oussama Yinssi\",\"departement\":\"Développement\"}', '2024-09-01 09:00:00'), " +
                    "(2, 'CREATE', 'Employee', 2, NULL, '{\"nomComplet\":\"Anass Yinssi\",\"departement\":\"Design\"}', '2025-11-01 10:00:00'), " +
                    "(2, 'UPDATE', 'Employee', 1, '{\"poste\":\"Développeur Junior\"}', '{\"poste\":\"Développeur Senior\"}', '2025-09-01 10:00:00'), " +
                    "(1, 'APPROVE', 'LeaveRequest', 2, '{\"statut\":\"EN_ATTENTE\"}', '{\"statut\":\"APPROUVE\"}', '2026-05-02 09:15:00'), " +
                    "(1, 'REFUSE', 'LeaveRequest', 3, '{\"statut\":\"EN_ATTENTE\"}', '{\"statut\":\"REFUSE\"}', '2026-05-28 10:00:00'), " +
                    "(2, 'ASSIGN', 'Asset', 1, '{\"statut\":\"DISPONIBLE\"}', '{\"statut\":\"ASSIGNE\",\"idEmploye\":1}', '2024-09-01 09:00:00')").executeUpdate();

            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
            System.out.println("✅ Seeding completed successfully!");
        } catch (Exception e) {
            System.err.println("❌ Seeding failed: " + e.getMessage());
            e.printStackTrace();
            try {
                entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
            } catch (Exception ex) {}
        }
    }
}
