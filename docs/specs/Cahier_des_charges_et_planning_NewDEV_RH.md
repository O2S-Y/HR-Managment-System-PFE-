# Cahier des charges et planning d’exécution

**Projet :** Système de gestion des ressources humaines *(NewDEV RH)*  
**Entreprise d’accueil :** NewDEV Maroc, Fès  
**Étudiant :** Oussama Yinssi
**Formation :** LST Génie Informatique — S6, FST Fès (USMBA)  
**Type :** Stage de fin d’études (PFE) — durée indicative **8 semaines**  
**Date du document :** avril 2026  

---

## 1. Objet du document

Ce document formalise :

1. Le **périmètre fonctionnel et technique** du livrable demandé (**cahier des charges détaillé**).
2. Un **planning d’exécution** en phases et jalons, à ajuster précisément à la date du **rendez-vous post-vacances** avec l’encadrant académique.

Il s’aligne sur le **PRD** du projet *(PRD_NewDEV_RH_v2)*, les **cas d’usage** *(Use_Case)*, la maquette **Figma** et les règles métier décrites dans le dossier de cadrage interne *(NewDEV_RH_Full_Context)*.

---

## 2. Contexte et objectifs

### 2.1 Contexte

NewDEV RH est une application web interne destinée à structurer les données RH, la circulation des demandes de congés, l’évaluation de performance et le parc IT, avec une **répartition stricte des responsabilités** entre trois types d’utilisateurs (Owner / RH / Employé).

### 2.2 Objectifs mesurables


| ID  | Objectif                                                                                   | Indicateur de réussite                                                                     |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| O1  | Gérer les fiches employés, l’historique de postes et les documents RH                      | CRUD RH + lecture Owner + profil/restreint Employé fonctionnels                            |
| O2  | Gérer les congés (types, quotas, demandes, validation) conformément au calendrier marocain | Calcul des jours ouvrés hors vendredi/samedi, règles de chevauchement et soldes respectées |
| O3  | Gérer les périodes d’évaluation, objectifs et saisie des résultats                         | Une période active, scores par objectif, note globale manuelle                             |
| O4  | Fournir un tableau de bord consolidé avec export PDF côté client                           | 4 KPI + graphiques lisibles ; export hors serveur Jasper                                   |
| O5  | Gérer les actifs IT avec historique d’affectations                                         | Une affectation active par actif lorsque la règle s’applique                               |
| O6  | Tracer les actions sensibles et notifier en interne                                        | Journal d’audit immuable ; notifications événementielles                                   |


---

## 3. Périmètre et hors périmètre

### 3.1 Dans le périmètre *(Version 1.0 livrée au PFE)*

- Modules **six** suivants avec API REST sécurisée et interface React :
  - Authentification et comptes.
  - Gestion des employés (historique, documents, archivage logique).
  - Congés et absences.
  - Évaluation de performance.
  - Tableau de bord RH.
  - Actifs IT.
  - Transversal : notifications applicatives et journal d’audit.

### 3.2 Hors périmètre explicitement *(à classer « Version 2.0 »)*

À ne pas développer pendant le stage (liste issue du cadrage projet) :

- Paie *(IGR, CNSS, AMO, bulletin de paie automatique)*.
- Recrutement / ATS.
- Pointage physique / badges.
- Formation type LMS vidéo lourde.
- Notifications **e-mail** *(SMTP)*.
- Conteneurisation **Docker**.
- Arborescence / organigramme interactif *(ex. React Flow)*.
- Génération **PDF serveur** *(Jasper, iTunes iText)* — PDF uniquement via **jsPDF + html2canvas** côté frontend.

La justification projet : périmètre compatible avec une réalisation **solo** et **en 8 semaines**, avec une valeur ajoutée claire *(actifs IT + audit + conformité métier « semaine MAR »)*.

---

## 4. Parties prenantes et rôles


| Rôle                     | Besoin principal                                                      | Contraintes                                         |
| ------------------------ | --------------------------------------------------------------------- | --------------------------------------------------- |
| **Propriétaire (Owner)** | Décider sur les congés, piloter les évaluations et le tableau de bord | Lecture seule employés/actifs hors décision         |
| **RH**                   | Administrer données, paramètres, affectations                         | Ne valide pas les congés à la place du propriétaire |
| **Employé**              | Consulter ses propres données uniquement                              | Aucune fuite cross-employé même par URL forcée      |


**Exigence de sécurité :** enforcement **Spring Security + JWT + `@PreAuthorize`** sur les contrôleurs : le masquage boutons dans React n’est pas une garantie suffisante.

---

## 5. Exigences fonctionnelles détaillées

### 5.1 Module Authentification et comptes

- Connexion / déconnexion avec jetons JWT + renouvellement raisonnable.
- Création de compte, changement de rôle, désactivation : **RH uniquement** (owner n’est pas forcément créé depuis l’application si politique métier différente — à préciser lors du RDV post-vacances).
- Changement de mot de passe par l’utilisateur connecté.

**Données :** table `users` — courriel unique, mot de passe haché (BCrypt conseillé), rôle Enum, état actif/inactif.

---

### 5.2 Module Gestion des employés

**Fonctionnalités RH :**

- Création / modification complète du profil.
- Changement de poste ou de département **avec écriture d’une nouvelle ligne dans l’historique** ; **pas de modification** des lignes d’historique existantes *(traçabilité)*.
- Archivage sans suppression physique *(statut ARCHIVE)*.
- Dépôt, liste et suppression de documents RH (fichiers sur disque, accès sécurisé par API).

**Fonctions Owner :** consultation des profils et de l’historique en lecture seule.

**Fonctions Employé :** lecture de son **propre** profil et de ses **propres** documents autorisés.

**Règles :**

- Cin / identités : unicités et validations à respecter comme dans le PRD.
- Jamais de suppression physique d’un employé.

---

### 5.3 Module Congés et absences

**RH :**

- Gestion des types de congés et quotas annuels.
- Ajustement manuel ponctuel des soldes lorsque métier *(report, correction)*.

**Employé :**

- Soumission d’une demande sur plage de dates future.
- Annulation tant que demande encore en attente selon les règles.

**Owner :**

- Liste des demandes ; approbation / refus avec commentaire éventuel.

**Règles métier obligatoires :**

- Calcul des **jours ouvrables** conforme au **Maroc : vendredi ET samedi non ouvrés** *(dimanche–jeudi ouvrés)* — **couvert par test unitaire** avant le reste de la logique métier critique.
- Blocage **serveur** si solde insuffisant, chevauchement de demandes, ou dates invalides.
- États machine : EN_ATTENTE → APPROUVE / REFUSE / ANNULE.

---

### 5.4 Module Évaluation de performance

**Owner :**

- Création et clôture de période *(une seule période « active » au même moment selon politique projet)*.
- Définition d’objectifs **par employé** et par période.
- Soumission d’une évaluation complète lorsque les contraintes métier sont remplies *(scores et commentaires sur chaque objectif, etc., selon PRD)*.
- Une **unique** ligne d’évaluation par couple *(période, employé)*.

**RH :**

- Lecture des évaluations et des périodes (pas de suppression arbitraire — respect des règles d’immuable après clôture).

**Employé :**

- Consultation de ses objectifs et résultats.

**Attention :**

- Note globale : **saisie manuelle** par l’owner ; **pas** de moyenne automatique imposée par le système si le PRD l’interdit ainsi.

---

### 5.5 Module Tableau de bord RH

- Quatre KPI définies dans le cadrage *(effectif actif, congés en cours, bilan éval récent ou agrégats mensuels, actifs IT non attribués — à caler strictement sur le PRD tableau figé)*.
- Graphiques lisibles (**Recharts**).
- Bouton export **PDF uniquement frontend** *(jsPDF + html2canvas)*.

---

### 5.6 Module Actifs IT

**RH :** inventaire, création/modification d’état *(dont passage hors-service), affectation/désaffectation.

**Owner :** consultation inventaire / historiques en lecture selon périmètre PRD.

**Employé :** consultation des actifs lui étant attribués.

**Règles :**

- Numéro de série unique *(contrainte base)*.
- Pas d’affectation à un employé archivé.
- États hors service ou maintenance peuvent empêcher l’affectation.
- Historique préservé : pas de suppression physique « facile » d’un bien avec historique lourd sans politique projet.

---

### 5.7 Transversal Notifications et audit

**Notifications applicatives *(évènements donnés dans le PRD)* :**

- Demande créée → Owner ;
- Acceptation/refus → Employé ;
- Évaluation disponible *(selon périmètre)* ;
- Affectation d’actif → Employé.

**Audit log :**

- Journal **immuable** : pas d’UPDATE ni DELETE fonctionnel *(et possiblement forcé aussi côté base — selon implantation actuelle)*.
- Données : acteur, type d’action, référence entité *(type + identifiant)*, valeurs anciennes/nouvelles *(JSON conseillé)*, horodatage.

Architecture : `**NotificationService` / audit appelés depuis la couche service**, pas directement depuis un contrôleur, pour garantir cohérence transactionnelle.

---

## 6. Exigences non fonctionnelles


| Domaine                     | Exigence                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Sécurité**                | JWT, rôle par endpoint, protection CSRF/contexte SPA à documenter, mots de passe hachés, pas d’URLs fichiers brutes ouvertes. |
| **Données**                 | MySQL 8, contraintes d’unicité sur courriel employé/actif série, FK cohérentes, aucune contradiction avec soft-delete.        |
| **Performance raisonnable** | Pagination liste employés/actifs/leaves où volume peut croître.                                                               |
| **Maintenabilité**          | Arborescence package Spring Boot claire ; composants React structurés.                                                        |
| **Traçabilité**             | Audit + historiques immuables.                                                                                                |
| **Accessibilité / UX**      | Respect des maquettes Figma et cohérence visuelle livrées.                                                                    |


---

## 7. Stack technique *(non renégociable sauf décision formalisée par encadrants)*


| Couche            | Technologie                                 |
| ----------------- | ------------------------------------------- |
| Backend           | Spring Boot **3.x**, Java **17**            |
| Sécurité          | Spring Security **+ JWT**                   |
| ORM               | JPA/Hibernate → MySQL 8                     |
| Frontend          | React **18**, appels Axios                  |
| Graphiques        | Recharts                                    |
| Stockage fichiers | Disque serveur sous répertoire non public   |
| PDF               | jsPDF **+ html2canvas** uniquement frontend |
| Versionnement     | Git / GitHub                                |


---

## 8. Livrables attendus en fin de PFE

1. Application **fonctionnelle** démontrant les flux principaux Owner / RH / Employé *(scénarios de soutenance rédigés à l’avance)*.
2. Dépot **Git** avec historique lisible *(commits par module ou par feature lorsque possible)*.
3. Scripts **SQL** *(schéma + jeu de données de démo)* conformes aux entités.
4. Diagrammes **UML** à jour *(cas d’usage, classes, séquence au minimum sur flux critiques validation congés + audit)*.
5. **Mémoire / rapport de stage** suivant les exigences FST/USMBA *(intro, conception, sécurité, implémentation, tests, résultats, bilan)*.
6. **Présentation orale / slides**.

---

## 9. Critères de validation projet *(à présenter tel quel à l’encadrant)*

1. Respect du **triple rôle** sans fuite fonctionnelle.
2. Respect des **règles congés** *(semaine marocaine)* avec **preuve de test automatique**.
3. **Pas de suppression physique** des données sensibles contre la politique PRD employés/congés/audit.
4. **Audit** véritablement utilisé lors d’actions clés créées/supprimées/modifiées.
5. Sécurité **serveur réelle**, pas cosmétique côté React.
6. **Tableaux de bord** et **PDF** conformes aux choix imposés.
7. Inventaire IT **avec intégrité** série / état / affectation.

---

## 10. Planning d’exécution *(à caler sur « après les vacances »)*

Hypothèse : **horizon 8 semaines** après reprise *(à confirmer à la première réunion).* Chaque ligne = objectif livrable vérifiable en fin de période.


| Semaine                                 | Focus                                               | Jalons livrables                                                                                                                              |
| --------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **S0** *(avant ou juste après reprise)* | Relecture cahier + validation encadrants            | Cahier validé *(ce document annoté ou signé)* + repo initial + schéma BDD gelé *(FR ou EN — une seule variante officielle pour le code)*      |
| **S1**                                  | Infrastructure & sécurité                           | Projets SB + React initialisés, MySQL connecté, inscription login JWT, trois rôles matérialisés en base avec comptes de démo                  |
| **S2**                                  | Module Employés partie 1                            | CRUD RH, documents upload *(API sécurisée)*                                                                                                   |
| **S3**                                  | Module Employés partie 2 + comptes                  | Historique obligatoirement append-only métier *(aligné conception)* ; gestion comptes utilisateurs par RH *(selon périmètre PRD déjà défini)* |
| **S4**                                  | Module Congés partie 1                              | Types, quotas, soldes ; soumission demande avec **calculateur jours ouvrés MAR** + tests JUnit                                                |
| **S5**                                  | Module Congés partie 2                              | Workflow décision Owner, mise à jour solde transactional, notifications liées événements                                                      |
| **S6**                                  | Évaluations + Actifs IT                             | Périodes, objectifs, évaluation avec scores détaillés ; inventaire + affectations + historique lecture                                        |
| **S7**                                  | Dashboard + Notifications fin + Audit complet + PDF | KPI + graphiques, export PDF, couverture audit sur actions principales *(transactionnel où multi-tables)*                                     |
| **S8**                                  | Consolidation défense                               | Polissage UI Figma cohérent, jeux de données démo narration soutenance, correctifs derniers bugs, mémoire + slides terminés                   |


**Événements de pilotage conseillés :**

- À la première séance après vacances : valider périmètre **strict** + date de soutenance indicative + décision officielle *(colonnes BD FR vs EN uniquement avec mapping JPA annoté pour éviter double vérité)*.
- À mi-parcours : démo bloc **Congés**.
- Une semaine avant fin : gel fonctionnel hors bugs bloquants.

---

## 11. Annexes *(références internes projet)*

- `NewDEV_RH_Full_Context.md` — décisions closes et exclusions.
- `PRD_NewDEV_RH_v2.docx`
- `Use_Case.pdf` / dossier `UML Diagrams`
- `Database/01_schema_fr.sql` ou `Database/01_schema.sql` *(une seule norme officielle après validation avec l’encadrant technique)*
- Maquettes **Figma** « NewDEV RH — UI Design »

---

**Mot de liaison pour répondre par e-mail aux encadrantes :**

> Bonjour Madame, Monsieur,  
> Comme convenu après votre message du [date], j’ai rédigé un **cahier des charges détaillé** du système RH NewDEV ainsi qu’un **planning d’exécution par semaines** jusqu’à la livra finale du mémoire. Le document synthétise le périmètre fonctionnel *(modules, rôles, règles métier, hors périmètre V2)*, les contraintes techniques imposées par l’entreprise et une planification jalonnée. Je reste bien entendu disponible après les vacances pour l’adapter à votre disponibilité et aux éventuels derniers arbitrages avant gel du périmètre. Cordialement, Oussama.

---

*Fin du document — version 1.0 pour encadrante académique.*