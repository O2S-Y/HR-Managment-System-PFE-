# Architecture simple — NewDEV RH (React + Spring Boot)

Ce document explique **où est quoi**, **qui fait quoi**, et **comment lire le code** même si tu débutes en React / Spring.

---

## 1) Deux applications séparées (très important)

Ton projet est composé de **2 applications** qui tournent séparément :

### A) Frontend (React)

- **Rôle** : afficher les écrans (UI), gérer la navigation, envoyer des requêtes HTTP au backend, stocker le JWT côté navigateur.
- **Technos** : React 18 + Axios
- **Dossier** : `frontend/`
- **Port dev** : `http://localhost:5173`

### B) Backend (Spring Boot)

- **Rôle** : appliquer les règles métier, sécuriser les endpoints, accéder à MySQL, retourner des réponses JSON.
- **Technos** : Spring Boot 3 (Java 17) + Spring Security + JWT + JPA/Hibernate + MySQL
- **Dossier** : (on le créera ensuite, ex. `backend/`)
- **Port** : `http://localhost:8080`

### Pourquoi les séparer ?

- Tu peux développer l’UI indépendamment du backend.
- La sécurité est **côté backend** (React ne protège rien, il ne fait que masquer des boutons).
- Ça correspond au modèle “application web moderne” attendu en PFE.

---

## 2) Comment ça communique ? (flux simple)

Le frontend parle au backend avec des requêtes HTTP JSON :

1. L’utilisateur remplit le formulaire login (React)
2. React envoie :
  - `POST /api/auth/login`
  - body : `{ "email": "...", "password": "..." }`
3. Spring Security valide l’utilisateur
4. Backend renvoie :
  - un **JWT** (token)
  - le **rôle** (OWNER / RH / EMPLOYE) éventuellement
5. React stocke le JWT (ex. `localStorage`) et l’envoie ensuite dans l’en-tête :
  - `Authorization: Bearer <token>`

Schéma :

React (5173)  →  Axios  →  Spring Boot (8080)  →  MySQL (3306)

---

## 3) Architecture frontend (React) — comment lire le code

### 3.1 Dossiers clés

Dans `frontend/src/` :

- `pages/` : **écrans** (Login, Dashboard, Liste employés, etc.)
- `services/` : **API** (Axios + fonctions `login()`, `getEmployees()`, …)
- `assets/` : images / logo
- `App.jsx` : point central qui choisit quelle page afficher
- `main.jsx` : bootstrap React (`createRoot`)
- `index.css` : styles globaux (variables CSS, reset)

### 3.2 Fichiers importants aujourd’hui (Login)

- `frontend/src/App.jsx`
  - affiche `<LoginPage />`
- `frontend/src/pages/LoginPage/LoginPage.jsx`
  - UI + état `email/password` + `onSubmit`
- `frontend/src/pages/LoginPage/loginPage.css`
  - styles de l’écran
- `frontend/src/services/http.js`
  - Axios configuré (baseURL)
- `frontend/src/services/authApi.js`
  - appelle `POST /api/auth/login`

### 3.3 Règles simples React (à retenir)

- **State** (`useState`) : variable qui vit dans le composant et déclenche un rerender.
  - exemple : `email`, `password`, `error`
- **Props** : données passées d’un composant parent à un enfant (on en utilisera plus tard).
- **Event handlers** : fonctions déclenchées par actions utilisateur (`onChange`, `onSubmit`).

### 3.4 Lecture “pas à pas” (méthode débutant)

1. Ouvre `App.jsx` → tu vois la page affichée.
2. Ouvre `LoginPage.jsx` → tu vois le formulaire + logique submit.
3. Suis l’appel `authApi.login(...)` → ouvre `authApi.js`.
4. `authApi.js` utilise `http` → ouvre `http.js` (baseURL et headers).

---

## 4) Architecture backend (Spring Boot) — à quoi s’attendre

Quand on créera `backend/`, on suivra une structure simple :

### 4.1 Structure recommandée

```
backend/src/main/java/.../newdevrh/
  config/          (security config, JWT, CORS)
  auth/            (controllers/services liés login)
  users/           (gestion comptes)
  employees/       (module M1)
  leaves/          (module M2)
  evaluations/     (module M3)
  assets/          (module M5)
  notifications/   (module M6)
  audit/           (module M6)
  common/          (exceptions, dto, utilitaires)
```

### 4.2 Pattern standard Spring

Pour chaque module :

- **Controller** : reçoit la requête HTTP, valide les droits (`@PreAuthorize`), appelle le service.
- **Service** : contient la **logique métier** (règles PRD) et les transactions (`@Transactional`).
- **Repository** : parle à la base (JPA).
- **Entity** : classe JPA qui correspond à une table MySQL.
- **DTO** : objets “entrée/sortie” API (évite d’exposer l’Entity directement).

### 4.3 Exemple mental (congé)

`LeaveController.approve()` (OWNER) → `LeaveService.approve()` (transaction) → update balance + update request + notification + audit → commit.

---

## 5) Règles de conception (importantes pour ton PFE)

- **Sécurité réelle** : backend protège, frontend cache.
- **Pas de delete physique** : statut/soft-delete.
- **Historique immuable** : `employee_history` et `audit_log` = INSERT uniquement.
- **Règle Maroc** : jours non ouvrés = vendredi + samedi, test unitaire obligatoire.
- **Transactions** : toute opération multi-table = `@Transactional`.

---

## 6) Comment je vais t’aider à “comprendre”, pas juste coder

À chaque fois qu’on ajoute un module, je vais :

- expliquer **le rôle** de chaque fichier créé (en 1 phrase claire)
- expliquer **le flux** (UI → API → service → DB)
- garder une structure stable (mêmes patterns pour tous les modules)
- écrire du code lisible (noms clairs, fonctions courtes)

---

## 7) Prochaine étape logique (quand tu dis “go”)

1. Ajouter le routing React (pages futures)
2. Ajouter une gestion de session JWT côté frontend (stockage + Axios interceptor)
3. Démarrer le backend Spring Boot + endpoint `/api/auth/login`
4. Connecter le login frontend au backend

