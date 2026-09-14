# NewDev RH - Système de Gestion des Ressources Humaines (PFE)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey.svg)]()

> **Projet de Fin d'Études (PFE) - Licence Sciences et Techniques (LST INFO)**  
> Développé par : **Oussama Yinssi**  
> Encadré à : **Faculté des Sciences et Techniques (FST)**

---

## 📌 Présentation du Projet

**NewDev RH** est une application web intégrée de gestion des ressources humaines, conçue pour automatiser et fluidifier les processus administratifs et managériaux d'une entreprise moderne :

- **Gestion des Employés & Profils** : Fiche employé complète, historique de carrière, gestion des documents et contrats.
- **Gestion des Congés & Absences** : Workflow de demande, validation hiérarchique, calcul de soldes et quotas.
- **Pointage & Présence** : Suivi des horaires et pointages journaliers.
- **Évaluations & Performances** : Campagnes d'évaluation périodiques, notation des objectifs et feedback RH / Owner.
- **Gestion du Parc Matériel (Assets IT)** : Attribution des équipements informatiques, historique des matériels et états.
- **Paie & Bulletins** : Configuration salariale, calcul des fiches de paie et export.
- **Audit & Sécurité RBAC** : Journalisation complète des actions d'audit et gestion des accès basée sur les rôles (`OWNER`, `RH`, `EMPLOYEE`).

---

## 🏗️ Architecture du Projet

Le projet suit une architecture moderne découplée en client-serveur (API REST) :

```
├── backend/            # API REST Spring Boot (Java 17 / Maven)
│   ├── src/main/java/  # Contrôleurs, Services, Entités JPA, Sécurité JWT
│   ├── pom.xml         # Dépendances Maven
│   └── .env.example    # Variables d'environnement type
│
├── frontend/           # Application SPA React (Vite, Modern CSS)
│   ├── src/            # Composants, Pages, Contextes Auth, Thèmes
│   └── package.json    # Dépendances NPM
│
├── database/           # Schémas et Données de Test SQL
│   ├── 01_schema_fr.sql
│   ├── 02_seed_data_fr.sql
│   └── *.cdm / *.ldm / *.pdm  # Modèles conceptuels et physiques
│
└── docs/               # Documentation et Livrables Académiques
    ├── academic/       # Rapport final PFE (PDF), Présentation (PPTX/PDF), Cahier des charges
    ├── uml/            # Diagrammes de Classes, Séquences, Activités (PlantUML, SVG)
    ├── specs/          # Architecture & Spécifications fonctionnelles (PRD)
    └── ui-mockups/     # Maquettes et prototypes d'interfaces
```

---

## 🚀 Démarrage Rapide

### 1. Base de Données (MySQL)
1. Créez la base de données :
   ```sql
   CREATE DATABASE newdev_rh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Exécutez les scripts dans l'ordre :
   - `database/01_schema_fr.sql`
   - `database/02_seed_data_fr.sql`

---

### 2. Backend (Spring Boot)
1. Rendez-vous dans le dossier backend :
   ```bash
   cd backend
   ```
2. Créez votre fichier d'environnement `.env` en vous basant sur `.env.example` :
   ```bash
   cp .env.example .env
   ```
   Renseignez vos identifiants MySQL (`DB_USERNAME`, `DB_PASSWORD`, `DB_URL`) et votre clé secrète JWT.
3. Lancez l'application avec le wrapper Maven :
   ```bash
   ./mvnw spring-boot:run
   ```
   *L'API démarre sur `http://localhost:8080`.*

---

### 3. Frontend (React + Vite)
1. Rendez-vous dans le dossier frontend :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
   *L'application est accessible sur `http://localhost:5173`.*

---

## 🔒 Sécurité & Rôles Utilisateurs

| Rôle | Périmètre d'Accès |
| :--- | :--- |
| **OWNER** | Validation finale des congés, soumission des évaluations, supervision globale, audit |
| **RH** | Gestion complète des employés, types de congés, inventaire matériel, paie, préparation des campagnes |
| **EMPLOYEE** | Consultation de profil, demande de congés, auto-évaluation, pointage, fiches de paie personnelles |

---

## 📄 Documentation Académique

Tous les documents académiques du PFE sont consultables dans le répertoire [`docs/academic/`](./docs/academic/) :
- **Rapport de PFE** : [`docs/academic/LST Report Yinssi Oussama Final.pdf`](./docs/academic/)
- **Support de Soutenance** : [`docs/academic/PFE LST Presentation.pdf`](./docs/academic/)
- **Cahier des Charges** : [`docs/academic/chaier_charge.pdf`](./docs/academic/)
