USE newdev_rh;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_log;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payroll;
TRUNCATE TABLE salary_configs;
TRUNCATE TABLE profile_change_requests;
TRUNCATE TABLE attendance;
TRUNCATE TABLE asset_assignments;
TRUNCATE TABLE assets;
TRUNCATE TABLE objective_scores;
TRUNCATE TABLE evaluations;
TRUNCATE TABLE objectives;
TRUNCATE TABLE evaluation_periods;
TRUNCATE TABLE leave_adjustments;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE leave_balances;
TRUNCATE TABLE leave_types;
TRUNCATE TABLE hr_documents;
TRUNCATE TABLE employee_history;
TRUNCATE TABLE employees;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users (default password is password123)
INSERT INTO users (id, courriel, hash_mot_de_passe, role, actif) VALUES
(1, 'owner@newdev.ma', '$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy', 'OWNER',   TRUE),
(2, 'rh@newdev.ma',    '$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy', 'RH',      TRUE),
(3, 'employee1@newdev.ma','$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy','EMPLOYE', TRUE),
(4, 'employee2@newdev.ma',  '$2a$10$MV3A0JDLQepHDre7.Lb5AerhMzJBijef1vfEZ4VcMuzW1dJrn55Vy','EMPLOYE', TRUE);

-- Employees (id_utilisateur mappings: oussama -> 3, anass -> 4, DRH -> 2)
INSERT INTO employees (id, id_utilisateur, nom_complet, cin, immatriculation_cnss, email, telephone, date_naissance, adresse, departement, poste, type_contrat, date_embauche, date_fin_contrat, statut, salaire_base, nombre_charges) VALUES
(1, 3, 'John Doe', 'XX000001', '0000000001', 'employee1@newdev.ma', '0600000001', '1997-10-15', '123 Avenue Mohammed V, Casablanca', 'Développement', 'Développeur Senior', 'CDI',   '2024-09-01', NULL,         'ACTIF', 15000.00, 1),
(2, 4, 'Jane Doe',   'XX000002', '0000000002', 'employee2@newdev.ma',   '0600000002', '2000-05-20', '45 Avenue des FAR, Rabat',       'Design',        'UX Designer',        'CDD',   '2025-11-01', '2026-10-31', 'ACTIF',  9500.00, 0),
(3, 2, 'Responsable RH', 'XX000003', '0000000003', 'rh@newdev.ma',      '0600000003', '1990-01-01', 'Bureau RH, Casablanca',             'Ressources Humaines', 'DRH',             'CDI',   '2023-01-01', NULL,         'ACTIF', 18000.00, 3);

-- Employee history
INSERT INTO employee_history (id, id_employe, ancien_poste, nouveau_poste, ancien_departement, nouveau_departement, motif_changement, date_changement, id_utilisateur_auteur) VALUES
(1, 1, 'Développeur Junior', 'Développeur Senior', 'Développement', 'Développement', 'Promotion après 1 an de bons résultats', '2025-12-01 10:00:00', 2);

-- Leave types
INSERT INTO leave_types (id, nom, categorie, quota_annuel_jours, justification_requise, actif) VALUES
(1, 'Congés payés', 'ANNUEL',     18, FALSE, TRUE),
(2, 'Maladie',      'MALADIE',     0, TRUE,  TRUE),
(3, 'Mariage',      'AUTRE',       4, TRUE,  TRUE),
(4, 'Sans solde',   'SANS_SOLDE',  0, FALSE, TRUE);

-- Leave balances
INSERT INTO leave_balances (id_employe, id_type_conge, annee, total_jours, jours_utilises) VALUES
(1, 1, 2026, 18.0, 5.0),
(1, 2, 2026,  0.0, 0.0),
(1, 3, 2026,  4.0, 0.0),
(2, 1, 2026, 18.0, 0.0),
(2, 2, 2026,  0.0, 0.0),
(2, 3, 2026,  4.0, 0.0),
(3, 1, 2026, 18.0, 0.0);

-- Leave requests (Pending, Approved, Refused)
INSERT INTO leave_requests (id, id_employe, id_type_conge, date_debut, date_fin, jours_ouvrables, commentaire, statut, date_soumission) VALUES
(1, 1, 1, '2026-07-06', '2026-07-10', 5, 'Vacances en famille à Agadir', 'EN_ATTENTE', '2026-06-10 14:30:00');

INSERT INTO leave_requests (id, id_employe, id_type_conge, date_debut, date_fin, jours_ouvrables, commentaire, statut, commentaire_decision, id_utilisateur_decideur, date_decision, date_soumission) VALUES
(2, 1, 1, '2026-04-12', '2026-04-16', 5, 'Repos personnel', 'APPROUVE', 'Validé, bon repos.', 1, '2026-04-08 09:15:00', '2026-04-07 16:00:00'),
(3, 2, 3, '2026-06-15', '2026-06-18', 4, 'Mon mariage', 'REFUSE', 'Refusé car manque d\'effectif durant cette période.', 1, '2026-06-10 10:00:00', '2026-06-08 09:00:00');

-- Leave adjustments
INSERT INTO leave_adjustments (id_employe, id_type_conge, jours_ajustement, motif, date_ajustement, id_rh_auteur) VALUES
(1, 1, 3, 'Report de congés de l\'année précédente', '2026-01-05', 2);

-- Evaluation period
INSERT INTO evaluation_periods (id, libelle, date_debut, date_fin, statut, id_utilisateur_createur) VALUES
(1, 'Q2 2026 — Évaluation trimestrielle', '2026-04-01', '2026-06-30', 'ACTIVE', 1);

-- Objectives
INSERT INTO objectives (id, id_periode_evaluation, titre, description_detail) VALUES
(1, 1, 'Livrer le module M1', 'Terminer la gestion des employés avec tests unitaires'),
(2, 1, 'Documentation technique', 'Rédiger les diagrammes UML et le rapport intermédiaire'),
(3, 1, 'Qualité du travail', 'Livrer un code propre et bien structuré');

-- Evaluations (finalized for Oussama)
INSERT INTO evaluations (id, id_employe, titre, date_evaluation, note_globale, commentaires, objectifs_atteints, axes_amelioration, statut, id_evaluateur) VALUES
(1, 1, 'Q2 2026 — Évaluation trimestrielle', '2026-06-12', 4.00, 'Excellent travail sur le module M1. Continuez ainsi.', 'Livrer le module M1, Qualité du travail', 'Documentation technique', 'FINALISE', 1);

-- Objective scores for Oussama
INSERT INTO objective_scores (id_evaluation, id_objectif, note, commentaire) VALUES
(1, 1, 5, 'Livrables impeccables'),
(1, 2, 3, 'Documentation à compléter'),
(1, 3, 4, 'Bonne structure du code');

-- Assets
INSERT INTO assets (id, nom, type_actif, numero_serie, date_acquisition, statut_actif, valeur, etat) VALUES
(1, 'Dell Latitude 7430',      'LAPTOP',    'DL7430-001',  '2024-01-15', 'ASSIGNE', 12000.00, 'BON'),
(2, 'MacBook Pro 14"',         'LAPTOP',    'MBP14-002',   '2024-06-10', 'DISPONIBLE', 25000.00, 'NEUF'),
(3, 'Dell UltraSharp U2723QE', 'MONITOR',   'DUS2723-003',  '2024-03-20', 'DISPONIBLE', 6000.00, 'BON'),
(4, 'iPhone 15',               'PHONE',     'IP15-004',    '2024-09-05', 'DISPONIBLE', 10000.00, 'NEUF');

-- Asset assignments
INSERT INTO asset_assignments (id_actif, id_employe, date_affectation, date_desaffectation, id_utilisateur_executant) VALUES
(1, 1, '2024-09-01 09:00:00', NULL, 2);

-- Attendance (Pointage)
INSERT INTO attendance (id_employe, date_pointage, heure_arrivee, heure_sortie, source_pointage, commentaire, id_rh_verificateur) VALUES
(1, '2026-06-10', '08:45:00', '17:15:00', 'EMPLOYE', NULL, NULL),
(1, '2026-06-11', '08:30:00', '17:20:00', 'EMPLOYE', NULL, NULL),
(1, '2026-06-12', '08:50:00', NULL,       'EMPLOYE', NULL, NULL),
(2, '2026-06-10', '09:00:00', '17:30:00', 'EMPLOYE', NULL, NULL),
(2, '2026-06-11', '09:15:00', '17:00:00', 'EMPLOYE', NULL, NULL);

-- Profile change requests
INSERT INTO profile_change_requests (id, id_employe, champs_modifies, statut, commentaire_rh, id_rh_verificateur, date_soumission, date_decision) VALUES
(1, 1, '{"telephone":"0661234567","adresse":"12 Rue Al Massira, Fès"}', 'APPROUVE', 'Vérifié en personne, OK.', 2, '2026-06-08 11:00:00', '2026-06-08 14:30:00');

INSERT INTO profile_change_requests (id, id_employe, champs_modifies, statut, commentaire_rh, id_rh_verificateur, date_soumission, date_decision) VALUES
(2, 1, '{"telephone":"0677889900"}', 'EN_ATTENTE', NULL, NULL, '2026-06-12 16:00:00', NULL);

-- Salary configurations
INSERT INTO salary_configs (id_employe, salaire_base, date_effet, id_rh_createur) VALUES
(1, 15000.00, '2024-09-01', 2),
(2, 9500.00,  '2025-11-01', 2);

-- Payroll
INSERT INTO payroll (id_employe, mois, annee, salaire_base, primes, deductions, cnss, amo, ir, cimr, autres_deductions, salaire_net, statut, date_paiement, id_rh_valideur) VALUES
(1, 5, 2026, 15000.00, 1000.00, 3200.00, 268.80, 339.00, 2592.20, 0.00, 0.00, 12800.00, 'PAYE',   '2026-05-30', 2),
(2, 5, 2026,  9500.00,    0.00, 1650.00, 268.80, 214.70, 1166.50, 0.00, 0.00,  7850.00, 'VALIDE', NULL,         2);

-- Notifications
INSERT INTO notifications (id_destinataire, id_expediteur, type_evenement, message, lu, id_reference, type_reference) VALUES
(1, NULL, 'LEAVE_SUBMITTED',           'Nouvelle demande de congé d\'John Doe (5 jours)', FALSE, 1, 'LeaveRequest'),
(3, NULL, 'LEAVE_APPROVED',            'Votre demande de congé du 12/04 au 16/04 a été approuvée', FALSE, 2, 'LeaveRequest'),
(3, NULL, 'ASSET_ASSIGNED',            'Un Dell Latitude 7430 vous a été affecté',                  TRUE,  1, 'AssetAssignment'),
(3, NULL, 'PROFILE_CHANGE_APPROVED',   'Votre demande de modification de profil a été approuvée',   TRUE,  1, 'ProfileChangeRequest'),
(3, 2,    'PAYSLIP_GENERATED',         'Votre bulletin de paie de mai 2026 est disponible',       FALSE, 1, 'Payslip'),
(4, 2,    'PAYSLIP_GENERATED',         'Votre bulletin de paie de mai 2026 est disponible',       FALSE, 2, 'Payslip'),
(3, 2,    'MESSAGE',                   'Merci de passer au bureau RH pour signer l\'avenant de contrat.', FALSE, NULL, NULL),
(3, 1,    'ANNOUNCEMENT',             'Réunion générale lundi 15 juin à 10h — salle de conférence.',       FALSE, NULL, NULL),
(4, 1,    'ANNOUNCEMENT',             'Réunion générale lundi 15 juin à 10h — salle de conférence.',       FALSE, NULL, NULL);

-- Audit log
INSERT INTO audit_log (id_acteur, action, type_entite, id_entite, ancienne_valeur, nouvelle_valeur, date_creation) VALUES
(2, 'CREATE', 'Employee', 1, NULL, '{"nomComplet":"John Doe","departement":"Développement"}', '2024-09-01 09:00:00'),
(2, 'CREATE', 'Employee', 2, NULL, '{"nomComplet":"Jane Doe","departement":"Design"}', '2025-11-01 10:00:00'),
(2, 'UPDATE', 'Employee', 1, '{"poste":"Développeur Junior"}', '{"poste":"Développeur Senior"}', '2025-12-01 10:00:00'),
(1, 'APPROVE', 'LeaveRequest', 2, '{"statut":"EN_ATTENTE"}', '{"statut":"APPROUVE"}', '2026-04-08 09:15:00'),
(2, 'ASSIGN', 'Asset', 1, '{"statut":"DISPONIBLE"}', '{"statut":"ASSIGNE","idEmploye":1}', '2024-09-01 09:00:00');