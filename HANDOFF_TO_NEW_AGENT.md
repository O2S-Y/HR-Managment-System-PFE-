# NewDEV RH — Handoff (for next agent)

**Workspace:** `C:\Users\PC\Desktop\PFE - Project`  
**Date:** 2026-05-05  
**Goal:** Enable a new agent to continue safely without breaking decisions, scope, or codebase.

---

## 1) Project in one paragraph

NewDEV RH is a web HR management system (PFE) with **three strict roles** (**OWNER**, **RH**, **EMPLOYE**) and 6 core modules: Employees, Leaves, Evaluations, Dashboard, IT Assets, Notifications/Audit. Stack is fixed: **Spring Boot 3 (Java 17) + Spring Security JWT + MySQL 8 + React 18 + Axios + Recharts + jsPDF/html2canvas (frontend PDF only)**. The frontend has started (Login + Dashboard UI). The database schema and UML class diagrams exist as PlantUML.

---

## 2) Non‑negotiable decisions / rules (must not be broken)

These rules come from the project context and must be enforced in backend (not just UI):

- **3 roles with strict authority separation**
  - **OWNER**: approves/refuses leave, submits performance evaluations, full dashboard
  - **RH**: manages data (employees, leave types/quotas, assets), creates accounts, cannot approve leaves/evals
  - **EMPLOYE**: only own data (own leaves, own evaluations, own assigned assets, own notifications)
- **Moroccan weekend rule**: non-working days are **Friday + Saturday** (not Sat/Sun). Working day calculator must reflect that and be unit-tested early.
- **No physical deletions**: employees/assets/etc. are archived/soft-deleted via status.
- **Immutable history**: `employee_history` and `audit_log` are INSERT-only (DB triggers included).
- **Server-side role enforcement**: `@PreAuthorize` on every controller method.
- **PDF export**: frontend-only via **jsPDF + html2canvas** (no JasperReports/iText backend PDFs).

---

## 3) What exists right now (implemented assets)

### A) Context / PRD / requirements

- `NewDEV_RH_Full_Context.md` (outside repo root on Desktop originally; also summarized in this project context)
- `PRD_NewDEV_RH_v2.docx`
- `Use_Case.pdf`
- UI reference images in `User Interface/` (includes `Login Page.png`, `Dashboard.png`, etc.)

### B) UML (PlantUML) class diagrams

Folder: `UML Diagrams/Class/`

- `00_class_global.puml` — global entities + relations
- `01_class_auth.puml`
- `02_class_m1_employees.puml`
- `03_class_m2_leaves.puml`
- `04_class_m3_evaluations.puml`
- `05_class_m5_assets.puml`
- `06_class_m6_notifications.puml`
- `07_diagramme_classes_complet_FR.puml` — single-sheet FR domain view aligned with PRD/schema

### C) Database scripts (MySQL 8)

Folder: `Database/`

- `01_schema.sql` — EN column names, 15 tables, constraints, triggers
- `02_seed_data.sql` — EN seed dataset
- `01_schema_fr.sql` — FR column names variant (tables kept EN; columns FR)
- `02_seed_data_fr.sql` — FR seed dataset variant

**Important:** EN and FR schema variants are mutually exclusive unless using different DB names. Choose one schema convention for the backend and stick to it.

### D) Frontend (React 18 — Vite)

Folder: `frontend/`

Installed deps: `axios`, `react-router-dom`, `recharts`.

Key files:

- Routing
  - `frontend/src/routes/AppRoutes.jsx` — `/login`, `/dashboard`
  - `frontend/src/main.jsx` — mounts Router + routes
- Login page
  - `frontend/src/pages/LoginPage/LoginPage.jsx`
  - `frontend/src/pages/LoginPage/loginPage.css`
  - Login currently redirects to `/dashboard` after calling `authApi.login` (backend not wired yet).
- Dashboard page (UI only, static demo data)
  - `frontend/src/pages/DashboardPage/DashboardPage.jsx`
  - `frontend/src/pages/DashboardPage/dashboardPage.css`
- API layer
  - `frontend/src/services/http.js` — Axios instance reads `VITE_API_URL` or defaults `http://localhost:8080`
  - `frontend/src/services/authApi.js` — calls `POST /api/auth/login`
- Assets
  - `frontend/src/assets/branding/logo_NewDev.png` — copied from repo root `logo_NewDev.png`

Dev server (when run): `npm run dev` (default `http://localhost:5173`)

### E) Architecture guide

- `ARCHITECTURE.md` — explains React vs Spring separation + how to read code + recommended backend structure.

### F) PFE deliverable document

- `Cahier_des_charges_et_planning_NewDEV_RH.md` — detailed scope + execution plan for academic supervisor.

---

## 4) Pending / next steps (in order)

1. **Decide scope change**: user requested “salary tracking” (manual taxes/deductions by RH).
  - Recommended: “salary tracking” only (manual deductions), not full payroll tax computation.
  - If accepted: update PRD, DB schema, class diagram, and add UML activity/sequence diagrams.
2. **Backend creation** (Spring Boot 3, Java 17)
  - Package structure, JWT security config, CORS for React dev origin.
  - Implement `/api/auth/login` compatible with frontend `authApi.login`.
3. **Frontend auth/session**
  - Store JWT securely (localStorage initially) + Axios interceptor for `Authorization: Bearer`.
  - Role-based route guard + post-login redirect.
4. **Implement remaining screens** (Figma links provided earlier; more to come).

---

## 5) “Do not” list (avoids breaking the project)

- Do not add Docker, email SMTP, JasperReports/iText, payroll automation, or org chart (unless scope explicitly changed and accepted).
- Do not use Sat/Sun as weekend in leave calculations (must be Fri/Sat).
- Do not rely on frontend-only role checks.
- Do not physically delete employees/assets/audit/history rows.

---

## 6) Files to give the next agent

Minimum safe set (copy/share these paths):

### Requirements + context

- `PRD_NewDEV_RH_v2.docx`
- `Use_Case.pdf`
- `NewDEV_RH_Full_Context.md` (if available outside repo, include it)
- `ARCHITECTURE.md`
- `Cahier_des_charges_et_planning_NewDEV_RH.md`

### UML

- Entire folder `UML Diagrams/Class/`

### Database

- Entire folder `Database/`

### Frontend

- Entire folder `frontend/`

### UI references

- Entire folder `User Interface/` (especially `Dashboard.png` and `Login Page.png`)

---

## 7) Copy‑paste prompt for the new agent

Use this prompt and attach the folders/files listed above:

```text
You are continuing the NewDEV RH PFE project in Cursor.

Read and follow these project rules:
- Stack is fixed: Spring Boot 3 (Java 17) + Spring Security JWT + MySQL 8 + React 18 + Axios + Recharts + jsPDF/html2canvas (frontend PDF only).
- Roles: OWNER / RH / EMPLOYE with strict authority separation.
- Moroccan weekend rule: Friday + Saturday are non-working days.
- No physical deletions; use status/soft delete.
- employee_history and audit_log are immutable (insert-only). DB triggers exist.
- Enforce roles server-side via @PreAuthorize; frontend hiding is UX only.

First, read `HANDOFF_TO_NEW_AGENT.md`, `ARCHITECTURE.md`, PRD, and the DB scripts.
Then:
1) Confirm current state of frontend (login + dashboard) and routing.
2) Prepare backend skeleton (Spring Boot) with JWT auth endpoint /api/auth/login that matches frontend authApi.
3) Keep code readable for a beginner: explain each file's purpose as you add it.
Note: user is considering adding salary tracking (manual deductions by RH). Do not implement payroll automation.
```

---

## 8) Quick smoke test commands (optional)

Frontend:

- `cd frontend`
- `npm install`
- `npm run dev`

Database:

- Run either EN or FR schema (choose one):
  - `Database/01_schema.sql` then `Database/02_seed_data.sql`
  - or `Database/01_schema_fr.sql` then `Database/02_seed_data_fr.sql`