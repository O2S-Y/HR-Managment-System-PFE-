USE newdev_rh;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_log;
TRUNCATE TABLE notifications;
TRUNCATE TABLE asset_assignments;
TRUNCATE TABLE assets;
TRUNCATE TABLE objective_scores;
TRUNCATE TABLE evaluations;
TRUNCATE TABLE objectives;
TRUNCATE TABLE evaluation_periods;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE leave_balances;
TRUNCATE TABLE leave_types;
TRUNCATE TABLE hr_documents;
TRUNCATE TABLE employee_history;
TRUNCATE TABLE employees;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, courriel, hash_mot_de_passe, role, actif) VALUES
(1, 'owner@newdev.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'OWNER',   TRUE),
(2, 'rh@newdev.ma',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RH',      TRUE),
(3, 'oussama@newdev.ma','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','EMPLOYE', TRUE),
(4, 'karim@newdev.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'EMPLOYE', TRUE),
(5, 'yasmine@newdev.ma','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','EMPLOYE', TRUE);

INSERT INTO employees (id, id_utilisateur, nom_complet, cin, departement, poste, type_contrat, date_embauche, date_fin_contrat, statut) VALUES
(1, 3, 'Oussama El Idrissi', 'AB123456', 'Développement', 'Développeur Full-Stack', 'CDI',   '2024-09-01', NULL,         'ACTIF'),
(2, 4, 'Karim Ouazzani',     'CD789012', 'Développement', 'Développeur Mobile',     'CDI',   '2023-03-15', NULL,         'ACTIF'),
(3, 5, 'Yasmine Berrada',    'EF345678', 'Design',        'UX/UI Designer',         'CDD',   '2025-11-01', '2026-10-31', 'ACTIF');

INSERT INTO employee_history (id_employe, ancien_poste, nouveau_poste, ancien_departement, nouveau_departement, motif_changement, date_changement, id_utilisateur_auteur) VALUES
(2, 'Développeur Junior', 'Développeur Mobile', 'Développement', 'Développement', 'Promotion après 1 an de bons résultats', '2024-04-01 10:00:00', 2);

INSERT INTO leave_types (id, nom, quota_annuel_jours, justification_requise, actif) VALUES
(1, 'Congés payés', 18, FALSE, TRUE),
(2, 'Maladie',       0, TRUE,  TRUE),
(3, 'Mariage',       4, TRUE,  TRUE),
(4, 'Sans solde',    0, FALSE, TRUE);

INSERT INTO leave_balances (id_employe, id_type_conge, annee, total_jours, jours_utilises) VALUES
(1, 1, 2026, 18.0, 5.0),
(1, 2, 2026,  0.0, 0.0),
(1, 3, 2026,  4.0, 0.0),
(2, 1, 2026, 18.0, 12.0),
(2, 2, 2026,  0.0, 2.0),
(2, 3, 2026,  4.0, 0.0),
(3, 1, 2026, 18.0, 0.0),
(3, 2, 2026,  0.0, 0.0),
(3, 3, 2026,  4.0, 0.0);

INSERT INTO leave_requests (id_employe, id_type_conge, date_debut, date_fin, jours_ouvrables, commentaire, statut, date_soumission) VALUES
(1, 1, '2026-05-04', '2026-05-08', 5, 'Vacances en famille à Agadir', 'EN_ATTENTE', '2026-04-25 14:30:00');

INSERT INTO leave_requests (id_employe, id_type_conge, date_debut, date_fin, jours_ouvrables, commentaire, statut, commentaire_decision, id_utilisateur_decideur, date_decision, date_soumission) VALUES
(2, 1, '2026-04-12', '2026-04-16', 5, 'Repos personnel', 'APPROUVE', 'Validé, bon repos.', 1, '2026-04-08 09:15:00', '2026-04-07 16:00:00');

INSERT INTO evaluation_periods (id, libelle, date_debut, date_fin, statut, id_utilisateur_createur) VALUES
(1, 'Q2 2026 — Évaluation trimestrielle', '2026-04-01', '2026-06-30', 'ACTIVE', 1);

INSERT INTO objectives (id_periode_evaluation, id_employe, titre, description_detail) VALUES
(1, 1, 'Livrer le module M1', 'Terminer la gestion des employés avec tests unitaires'),
(1, 1, 'Documentation technique', 'Rédiger les diagrammes UML et le rapport intermédiaire'),
(1, 2, 'App mobile v2', 'Migrer le projet sur la nouvelle stack Flutter');

INSERT INTO assets (id, nom, type_actif, numero_serie, description_detail, date_acquisition, statut_actif) VALUES
(1, 'Dell Latitude 7430',     'LAPTOP',    'DL7430-001', 'i7, 16GB RAM, 512GB SSD',     '2024-01-15', 'ASSIGNE'),
(2, 'MacBook Pro 14"',        'LAPTOP',    'MBP14-002',  'M3 Pro, 18GB, 1TB',           '2024-06-10', 'DISPONIBLE'),
(3, 'Dell UltraSharp U2723QE','MONITOR',   'DUS2723-003','27" 4K USB-C',                '2024-03-20', 'DISPONIBLE'),
(4, 'iPhone 15',              'PHONE',     'IP15-004',   'Pro de service',              '2024-09-05', 'DISPONIBLE'),
(5, 'HP EliteBook 850',       'LAPTOP',    'HP850-005',  'En réparation écran',         '2023-02-01', 'EN_MAINTENANCE');

INSERT INTO asset_assignments (id_actif, id_employe, date_affectation, date_desaffectation, id_utilisateur_executant) VALUES
(1, 1, '2024-09-01 09:00:00', NULL, 2);

INSERT INTO notifications (id_destinataire, type_evenement, message, lu, id_reference, type_reference) VALUES
(1, 'LEAVE_SUBMITTED', 'Nouvelle demande de congé d''Oussama El Idrissi (5 jours)', FALSE, 1, 'LeaveRequest'),
(4, 'LEAVE_APPROVED',  'Votre demande de congé du 12/04 au 16/04 a été approuvée', FALSE, 2, 'LeaveRequest'),
(3, 'ASSET_ASSIGNED',  'Un Dell Latitude 7430 vous a été assigné',                  TRUE,  1, 'AssetAssignment');

INSERT INTO audit_log (id_acteur, action, type_entite, id_entite, ancienne_valeur, nouvelle_valeur, date_creation) VALUES
(2, 'CREATE', 'Employee', 1,
 NULL,
 '{"nomComplet":"Oussama El Idrissi","departement":"Développement"}',
 '2024-09-01 09:00:00'),
(2, 'CREATE', 'Employee', 2,
 NULL,
 '{"nomComplet":"Karim Ouazzani","departement":"Développement"}',
 '2023-03-15 10:00:00'),
(2, 'UPDATE', 'Employee', 2,
 '{"poste":"Développeur Junior"}',
 '{"poste":"Développeur Mobile"}',
 '2024-04-01 10:00:00'),
(1, 'APPROVE', 'LeaveRequest', 2,
 '{"statut":"EN_ATTENTE"}',
 '{"statut":"APPROUVE"}',
 '2026-04-08 09:15:00'),
(2, 'ASSIGN', 'Asset', 1,
 '{"statut":"DISPONIBLE"}',
 '{"statut":"ASSIGNE","idEmploye":1}',
 '2024-09-01 09:00:00');
 
 select * from users;