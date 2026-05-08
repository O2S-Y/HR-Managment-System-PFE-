import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage/LoginPage'
import { DashboardPage } from '../pages/DashboardPage/DashboardPage'
import { EmployeesListPage } from '../pages/EmployeesListPage/EmployeesListPage'
import { EmployeeProfilePage } from '../pages/EmployeeProfilePage/EmployeeProfilePage'
import { LeavesEmployeePage } from '../pages/LeavesEmployeePage/LeavesEmployeePage'
import { LeavesOwnerPage } from '../pages/LeavesOwnerPage/LeavesOwnerPage'
import { LeavesAdminPage } from '../pages/LeavesAdminPage/LeavesAdminPage'
import { EvaluationOwnerPage } from '../pages/EvaluationOwnerPage/EvaluationOwnerPage'
import { EvaluationRhPage } from '../pages/EvaluationRhPage/EvaluationRhPage'
import { EvaluationEmployeePage } from '../pages/EvaluationEmployeePage/EvaluationEmployeePage'
import { AssetsInventoryPage } from '../pages/AssetsInventoryPage/AssetsInventoryPage'
import { AssetsMyPage } from '../pages/AssetsMyPage/AssetsMyPage'
import { SettingsPage } from '../pages/SettingsPage/SettingsPage'
import { ProtectedRoute } from '../components/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ── Module 4 — Tableau de Bord RH ──
           Owner : Consulter KPI + Exporter PDF
           RH    : Consulter suivi opérationnel */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER', 'RH']} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* ── Module 1 — Gestion des Employés ──
           RH    : Créer/Modifier/Archiver/Documents/Consulter profils
           Owner : Consulter les profils et l'historique (lecture seule) */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER', 'RH']} />}>
        <Route path="/employees" element={<EmployeesListPage />} />
        <Route path="/employees/:employeeId" element={<EmployeeProfilePage />} />
      </Route>

      {/* ── Module 1 — Employé : son propre profil ──
           Consulter/MAJ son propre profil + Consulter ses propres documents */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYE']} />}>
        <Route path="/employees/me" element={<EmployeeProfilePage />} />
      </Route>

      {/* ── Module 2 — Congés : Owner ──
           Approuver/Refuser les demandes */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
        <Route path="/leaves/owner" element={<LeavesOwnerPage />} />
      </Route>

      {/* ── Module 2 — Congés : RH ──
           Configurer types et quotas + Ajuster manuellement les soldes */}
      <Route element={<ProtectedRoute allowedRoles={['RH']} />}>
        <Route path="/leaves/admin" element={<LeavesAdminPage />} />
      </Route>

      {/* ── Module 2 — Congés : Employé ──
           Soumettre/Annuler une demande + Consulter son solde et historique */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYE']} />}>
        <Route path="/leaves/me" element={<LeavesEmployeePage />} />
      </Route>

      {/* ── Module 3 — Évaluations : Owner ──
           Créer/Clôturer période + Définir objectifs + Soumettre évaluation + Générer rapport */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
        <Route path="/evaluations/owner" element={<EvaluationOwnerPage />} />
      </Route>

      {/* ── Module 3 — Évaluations : RH ──
           Consulter les évaluations (lecture seule) + Générer rapport de données */}
      <Route element={<ProtectedRoute allowedRoles={['RH']} />}>
        <Route path="/evaluations/rh" element={<EvaluationRhPage />} />
      </Route>

      {/* ── Module 3 — Évaluations : Employé ──
           Consulter ses résultats et objectifs */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYE']} />}>
        <Route path="/evaluations/me" element={<EvaluationEmployeePage />} />
      </Route>

      {/* ── Module 5 — Actifs IT : Owner + RH ──
           RH    : Gérer inventaire (CRUD) + Assigner/Désassigner + Consulter inventaire
           Owner : Consulter inventaire et historique (lecture seule) */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER', 'RH']} />}>
        <Route path="/assets" element={<AssetsInventoryPage />} />
      </Route>

      {/* ── Module 5 — Actifs IT : Employé ──
           Consulter ses actifs assignés */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYE']} />}>
        <Route path="/assets/me" element={<AssetsMyPage />} />
      </Route>

      {/* ── Module AUTH — Settings (tous les utilisateurs authentifiés) ── */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER', 'RH', 'EMPLOYE']} />}>
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
