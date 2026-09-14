CREATE DATABASE IF NOT EXISTS newdev_rh
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE newdev_rh;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- MODULE AUTH
-- =====================================================================

CREATE TABLE users (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    courriel            VARCHAR(150)    NOT NULL,
    hash_mot_de_passe   VARCHAR(72)     NOT NULL,
    role                ENUM('OWNER','RH','EMPLOYE') NOT NULL,
    actif               BOOLEAN         NOT NULL DEFAULT TRUE,
    doit_changer_mot_de_passe BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_users_courriel (courriel),
    KEY idx_users_role (role),
    KEY idx_users_actif (actif)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 1 — GESTION DES EMPLOYÉS
-- =====================================================================

CREATE TABLE employees (
    id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_utilisateur          BIGINT UNSIGNED NOT NULL,
    nom_complet             VARCHAR(150)    NOT NULL,
    cin                     VARCHAR(20)     NOT NULL,
    immatriculation_cnss    VARCHAR(30)     NULL,
    email                   VARCHAR(150)    NULL,
    telephone               VARCHAR(30)     NULL,
    date_naissance          DATE            NULL,
    adresse                 VARCHAR(500)    NULL,
    departement             VARCHAR(100)    NOT NULL,
    poste                   VARCHAR(100)    NOT NULL,
    type_contrat            ENUM('CDI','CDD','STAGE','INTERIM') NOT NULL,
    date_embauche           DATE            NOT NULL,
    date_fin_contrat        DATE            NULL,
    statut                  ENUM('ACTIF','ARCHIVE') NOT NULL DEFAULT 'ACTIF',
    salaire_base            DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    nombre_charges          INT             NOT NULL DEFAULT 0,
    date_creation           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_employees_utilisateur (id_utilisateur),
    UNIQUE KEY uk_employees_cin (cin),
    KEY idx_employees_statut (statut),
    KEY idx_employees_departement (departement),

    CONSTRAINT fk_employees_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_employees_dates
        CHECK (date_fin_contrat IS NULL OR date_fin_contrat >= date_embauche)
) ENGINE=InnoDB;

CREATE TABLE employee_history (
    id                         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                 BIGINT UNSIGNED NOT NULL,
    ancien_poste               VARCHAR(100)    NOT NULL,
    nouveau_poste              VARCHAR(100)    NOT NULL,
    ancien_departement         VARCHAR(100)    NOT NULL,
    nouveau_departement        VARCHAR(100)    NOT NULL,
    motif_changement           VARCHAR(500)    NULL,
    date_changement            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_utilisateur_auteur      BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id),
    KEY idx_emphist_employe (id_employe),
    KEY idx_emphist_date (date_changement),

    CONSTRAINT fk_emphist_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_emphist_utilisateur
        FOREIGN KEY (id_utilisateur_auteur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE hr_documents (
    id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe              BIGINT UNSIGNED NOT NULL,
    nom_fichier_interne     VARCHAR(255)    NOT NULL,
    nom_fichier_original    VARCHAR(255)    NOT NULL,
    chemin_fichier          VARCHAR(500)    NOT NULL,
    taille_octets           BIGINT UNSIGNED NOT NULL,
    type_mime               VARCHAR(100)    NOT NULL,
    type_document           ENUM('CONTRAT','CIN','DIPLOME','ATTESTATION','AUTRE') NOT NULL,
    date_depot              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_utilisateur_depot    BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id),
    KEY idx_hrdoc_employe (id_employe),
    KEY idx_hrdoc_type (type_document),

    CONSTRAINT fk_hrdoc_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_hrdoc_utilisateur
        FOREIGN KEY (id_utilisateur_depot) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 2 — CONGÉS & ABSENCES
-- =====================================================================

CREATE TABLE leave_types (
    id                              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom                             VARCHAR(100)    NOT NULL,
    categorie                       ENUM('ANNUEL','MALADIE','MATERNITE','PATERNITE','SANS_SOLDE','AUTRE') NOT NULL DEFAULT 'AUTRE',
    quota_annuel_jours              INT UNSIGNED    NOT NULL,
    justification_requise           BOOLEAN         NOT NULL DEFAULT FALSE,
    actif                           BOOLEAN         NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id),
    UNIQUE KEY uk_leave_types_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE leave_balances (
    id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe              BIGINT UNSIGNED NOT NULL,
    id_type_conge           BIGINT UNSIGNED NOT NULL,
    annee                   SMALLINT UNSIGNED NOT NULL,
    total_jours             DECIMAL(5,1)    NOT NULL,
    jours_utilises          DECIMAL(5,1)    NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    UNIQUE KEY uk_solde (id_employe, id_type_conge, annee),
    KEY idx_solde_annee (annee),

    CONSTRAINT fk_solde_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_solde_type
        FOREIGN KEY (id_type_conge) REFERENCES leave_types(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_solde_util_ok CHECK (jours_utilises <= total_jours),
    CONSTRAINT chk_solde_positif CHECK (total_jours >= 0 AND jours_utilises >= 0)
) ENGINE=InnoDB;

CREATE TABLE leave_requests (
    id                              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                      BIGINT UNSIGNED NOT NULL,
    id_type_conge                   BIGINT UNSIGNED NOT NULL,
    date_debut                      DATE            NOT NULL,
    date_fin                        DATE            NOT NULL,
    jours_ouvrables                 INT UNSIGNED    NOT NULL,
    commentaire                     VARCHAR(1000)   NULL,
    statut                          ENUM('EN_ATTENTE','APPROUVE','REFUSE','ANNULE') NOT NULL DEFAULT 'EN_ATTENTE',
    commentaire_decision            VARCHAR(1000)   NULL,
    id_utilisateur_decideur         BIGINT UNSIGNED NULL,
    date_decision                   TIMESTAMP       NULL,
    date_soumission                 TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    justification_original_filename VARCHAR(255)    NULL,
    justification_internal_filename VARCHAR(255)    NULL,

    PRIMARY KEY (id),
    KEY idx_demande_employe (id_employe),
    KEY idx_demande_statut (statut),
    KEY idx_demande_dates (date_debut, date_fin),

    CONSTRAINT fk_demande_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_demande_type
        FOREIGN KEY (id_type_conge) REFERENCES leave_types(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_demande_decideur
        FOREIGN KEY (id_utilisateur_decideur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_demande_dates CHECK (date_fin >= date_debut),
    CONSTRAINT chk_demande_jours CHECK (jours_ouvrables >= 1)
) ENGINE=InnoDB;

CREATE TABLE leave_adjustments (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                  BIGINT UNSIGNED NOT NULL,
    id_type_conge               BIGINT UNSIGNED NOT NULL,
    jours_ajustement            INT             NOT NULL,
    motif                       VARCHAR(500)    NULL,
    date_ajustement             DATE            NOT NULL,
    id_rh_auteur                BIGINT UNSIGNED NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_ajust_employe (id_employe),
    KEY idx_ajust_type (id_type_conge),

    CONSTRAINT fk_ajust_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ajust_type
        FOREIGN KEY (id_type_conge) REFERENCES leave_types(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ajust_auteur
        FOREIGN KEY (id_rh_auteur) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 3 — ÉVALUATION DE PERFORMANCE
-- =====================================================================

CREATE TABLE evaluation_periods (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    libelle                     VARCHAR(100)    NOT NULL,
    date_debut                  DATE            NOT NULL,
    date_fin                    DATE            NOT NULL,
    statut                      ENUM('ACTIVE','CLOTUREE') NOT NULL DEFAULT 'ACTIVE',
    id_utilisateur_createur     BIGINT UNSIGNED NOT NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_periode_statut (statut),

    CONSTRAINT fk_periode_createur
        FOREIGN KEY (id_utilisateur_createur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_periode_dates CHECK (date_fin >= date_debut)
) ENGINE=InnoDB;

CREATE TABLE objectives (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_periode_evaluation       BIGINT UNSIGNED NOT NULL,
    titre                       VARCHAR(200)    NOT NULL,
    description_detail          TEXT            NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_obj_periode (id_periode_evaluation),

    CONSTRAINT fk_obj_periode
        FOREIGN KEY (id_periode_evaluation) REFERENCES evaluation_periods(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE evaluations (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                  BIGINT UNSIGNED NOT NULL,
    titre                       VARCHAR(200)    NOT NULL,
    date_evaluation             DATE            NOT NULL,
    note_globale                DECIMAL(4,2)    NOT NULL,
    commentaires                TEXT            NULL,
    objectifs_atteints          TEXT            NULL,
    axes_amelioration           TEXT            NULL,
    statut                      ENUM('BROUILLON','FINALISE') NOT NULL DEFAULT 'BROUILLON',
    id_evaluateur               BIGINT UNSIGNED NOT NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_eval_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_eval_evaluateur
        FOREIGN KEY (id_evaluateur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


CREATE TABLE objective_scores (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_evaluation             BIGINT UNSIGNED NOT NULL,
    id_objectif                 BIGINT UNSIGNED NOT NULL,
    note                        TINYINT UNSIGNED NOT NULL,
    commentaire                 TEXT            NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_note_eval_obj (id_evaluation, id_objectif),

    CONSTRAINT fk_note_evaluation
        FOREIGN KEY (id_evaluation) REFERENCES evaluations(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_note_objectif
        FOREIGN KEY (id_objectif) REFERENCES objectives(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_note_obj CHECK (note BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 5 — GESTION DES ACTIFS IT
-- =====================================================================

CREATE TABLE assets (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom                         VARCHAR(150)    NOT NULL,
    type_actif                  ENUM('LAPTOP','DESKTOP','MONITOR','PHONE','TABLET','ACCESSORY','OTHER') NOT NULL,
    numero_serie                VARCHAR(100)    NOT NULL,
    date_acquisition            DATE            NULL,
    valeur                      DECIMAL(10,2)   NULL,
    statut_actif                ENUM('DISPONIBLE','ASSIGNE','EN_MAINTENANCE','HORS_SERVICE') NOT NULL DEFAULT 'DISPONIBLE',
    etat                        ENUM('NEUF','BON','USE','DEFECTUEUX') NOT NULL DEFAULT 'BON',
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_actif_numero_serie (numero_serie),
    KEY idx_actif_statut (statut_actif),
    KEY idx_actif_type (type_actif)
) ENGINE=InnoDB;

CREATE TABLE asset_assignments (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_actif                    BIGINT UNSIGNED NOT NULL,
    id_employe                  BIGINT UNSIGNED NOT NULL,
    date_affectation            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_desaffectation         TIMESTAMP       NULL,
    id_utilisateur_executant    BIGINT UNSIGNED NOT NULL,

    indicateur_actif            TINYINT GENERATED ALWAYS AS
                                    (IF(date_desaffectation IS NULL, 1, NULL)) VIRTUAL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_affectation_en_cours (id_actif, indicateur_actif),
    KEY idx_assign_actif (id_actif),
    KEY idx_assign_employe (id_employe),

    CONSTRAINT fk_assign_actif
        FOREIGN KEY (id_actif) REFERENCES assets(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_assign_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_assign_executant
        FOREIGN KEY (id_utilisateur_executant) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_assign_dates
        CHECK (date_desaffectation IS NULL OR date_desaffectation >= date_affectation)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 1 (suite) — POINTAGE / PRÉSENCE
-- =====================================================================

CREATE TABLE attendance (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                  BIGINT UNSIGNED NOT NULL,
    date_pointage               DATE            NOT NULL,
    heure_arrivee               TIME            NULL,
    heure_sortie                TIME            NULL,
    source_pointage             ENUM('EMPLOYE','RH') NOT NULL DEFAULT 'EMPLOYE',
    commentaire                 VARCHAR(500)    NULL,
    id_rh_verificateur          BIGINT UNSIGNED NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_attendance_employe_date (id_employe, date_pointage),
    KEY idx_attendance_date (date_pointage),

    CONSTRAINT fk_attendance_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_rh
        FOREIGN KEY (id_rh_verificateur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 1 (suite) — DEMANDES DE MODIFICATION DE PROFIL
-- =====================================================================

CREATE TABLE profile_change_requests (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                  BIGINT UNSIGNED NOT NULL,
    champs_modifies             JSON            NOT NULL,
    statut                      ENUM('EN_ATTENTE','APPROUVE','REFUSE') NOT NULL DEFAULT 'EN_ATTENTE',
    commentaire_rh              VARCHAR(500)    NULL,
    id_rh_verificateur          BIGINT UNSIGNED NULL,
    date_soumission             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_decision               TIMESTAMP       NULL,

    PRIMARY KEY (id),
    KEY idx_pcr_employe (id_employe),
    KEY idx_pcr_statut (statut),

    CONSTRAINT fk_pcr_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pcr_rh
        FOREIGN KEY (id_rh_verificateur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 7 — GESTION DE LA PAIE
-- =====================================================================

CREATE TABLE salary_configs (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                  BIGINT UNSIGNED NOT NULL,
    salaire_base                DECIMAL(10,2)   NOT NULL,
    date_effet                  DATE            NOT NULL,
    id_rh_createur              BIGINT UNSIGNED NOT NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_salary_employe (id_employe),
    KEY idx_salary_date (date_effet),

    CONSTRAINT fk_salary_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_salary_rh
        FOREIGN KEY (id_rh_createur) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_salary_positif CHECK (salaire_base > 0)
) ENGINE=InnoDB;

CREATE TABLE payroll (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_employe                  BIGINT UNSIGNED NOT NULL,
    mois                        TINYINT UNSIGNED NOT NULL,
    annee                       SMALLINT UNSIGNED NOT NULL,
    salaire_base                DECIMAL(10,2)   NOT NULL,
    primes                      DECIMAL(10,2)   NOT NULL DEFAULT 0,
    deductions                  DECIMAL(10,2)   NOT NULL DEFAULT 0,
    cnss                        DECIMAL(10,2)   NOT NULL DEFAULT 0,
    amo                         DECIMAL(10,2)   NOT NULL DEFAULT 0,
    ir                          DECIMAL(10,2)   NOT NULL DEFAULT 0,
    cimr                        DECIMAL(10,2)   NOT NULL DEFAULT 0,
    autres_deductions           DECIMAL(10,2)   NOT NULL DEFAULT 0,
    salaire_net                 DECIMAL(10,2)   NOT NULL,
    statut                      ENUM('BROUILLON','VALIDE','PAYE') NOT NULL DEFAULT 'BROUILLON',
    date_paiement               DATE            NULL,
    id_rh_valideur              BIGINT UNSIGNED NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_payroll_employe_mois (id_employe, mois, annee),
    KEY idx_payroll_annee_mois (annee, mois),

    CONSTRAINT fk_payroll_employe
        FOREIGN KEY (id_employe) REFERENCES employees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payroll_valideur
        FOREIGN KEY (id_rh_valideur) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_payroll_mois CHECK (mois BETWEEN 1 AND 12),
    CONSTRAINT chk_payroll_montants CHECK (salaire_base >= 0 AND salaire_net >= 0)
) ENGINE=InnoDB;

-- =====================================================================
-- MODULE 6 — NOTIFICATIONS & AUDIT
-- =====================================================================

CREATE TABLE notifications (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_destinataire             BIGINT UNSIGNED NOT NULL,
    id_expediteur               BIGINT UNSIGNED NULL,
    type_evenement              ENUM('LEAVE_SUBMITTED','LEAVE_APPROVED','LEAVE_REFUSED',
                                    'EVALUATION_SUBMITTED','ASSET_ASSIGNED','ASSET_RETURNED',
                                    'PROFILE_CHANGE_SUBMITTED','PROFILE_CHANGE_APPROVED','PROFILE_CHANGE_REJECTED',
                                    'PAYSLIP_GENERATED','PASSWORD_CHANGED','ANNOUNCEMENT','MESSAGE') NOT NULL,
    message                     VARCHAR(500)    NOT NULL,
    lu                          BOOLEAN         NOT NULL DEFAULT FALSE,
    id_reference                BIGINT UNSIGNED NULL,
    type_reference              VARCHAR(50)     NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_notif_dest_lu (id_destinataire, lu),
    KEY idx_notif_date (date_creation),
    KEY idx_notif_expediteur (id_expediteur),

    CONSTRAINT fk_notif_destinataire
        FOREIGN KEY (id_destinataire) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notif_expediteur
        FOREIGN KEY (id_expediteur) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_log (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_acteur                   BIGINT UNSIGNED NULL,
    action                      VARCHAR(50)     NOT NULL,
    type_entite                 VARCHAR(100)    NOT NULL,
    id_entite                   BIGINT UNSIGNED NULL,
    ancienne_valeur           JSON            NULL,
    nouvelle_valeur             JSON            NULL,
    date_creation               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_audit_acteur (id_acteur),
    KEY idx_audit_entite (type_entite, id_entite),
    KEY idx_audit_date (date_creation),

    CONSTRAINT fk_audit_acteur
        FOREIGN KEY (id_acteur) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- IMMUABILITÉ — employee_history et audit_log (INSERT uniquement)
-- =====================================================================

DELIMITER $$

CREATE TRIGGER trg_hist_postes_interdit_update
BEFORE UPDATE ON employee_history FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'historique des postes : mise à jour interdite';
END$$

CREATE TRIGGER trg_hist_postes_interdit_delete
BEFORE DELETE ON employee_history FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'historique des postes : suppression interdite';
END$$

CREATE TRIGGER trg_audit_interdit_update
BEFORE UPDATE ON audit_log FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'journal d''audit : mise à jour interdite';
END$$

CREATE TRIGGER trg_audit_interdit_delete
BEFORE DELETE ON audit_log FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'journal d''audit : suppression interdite';
END$$

DELIMITER ;
