import { http } from './http'

// ═══════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════
export const authApi = {
  login: async ({ email, password }) => {
    const res = await http.post('/api/auth/login', { email, password })
    return res.data.data // ApiResponse<JwtResponse> → unwrap .data
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    // Email comes from JWT token on the backend (SecurityContext.getAuthentication().getName())
    const res = await http.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return res.data
  },

  resetOwnerPassword: async ({ recoveryKey, newPassword }) => {
    const res = await http.post('/api/auth/owner/reset-password', {
      recoveryKey,
      newPassword,
    })
    return res.data
  },
}

// ═══════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════
export const dashboardApi = {
  getStats: async () => {
    const res = await http.get('/api/dashboard/stats')
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  EMPLOYEES
// ═══════════════════════════════════════════════
export const employeeApi = {
  getAll: async () => {
    const res = await http.get('/api/employees')
    return res.data.data
  },

  getById: async (id) => {
    const res = await http.get(`/api/employees/${id}`)
    return res.data.data
  },

  getMe: async () => {
    const res = await http.get('/api/employees/me')
    return res.data.data
  },

  create: async (data) => {
    const res = await http.post('/api/employees', data)
    return res.data.data
  },

  update: async (id, data) => {
    const res = await http.put(`/api/employees/${id}`, data)
    return res.data.data
  },

  archive: async (id) => {
    const res = await http.patch(`/api/employees/${id}/archive`)
    return res.data
  },

  unarchive: async (id) => {
    const res = await http.patch(`/api/employees/${id}/unarchive`)
    return res.data
  },

  getHistory: async (id) => {
    const res = await http.get(`/api/employees/${id}/history`)
    return res.data.data
  },

  getMyHistory: async () => {
    const res = await http.get('/api/employees/me/history')
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  LEAVES (Congés)
// ═══════════════════════════════════════════════
export const leaveApi = {
  getTypes: async () => {
    const res = await http.get('/api/leaves/types')
    return res.data.data
  },

  getMyLeaves: async () => {
    const res = await http.get('/api/leaves/me')
    return res.data.data
  },

  submitLeave: async (data) => {
    // data: { idTypeConge, dateDebut, dateFin, joursOuvrables, commentaire }
    const res = await http.post('/api/leaves', data)
    return res.data.data
  },

  getPending: async () => {
    const res = await http.get('/api/leaves/pending')
    return res.data.data
  },

  processLeave: async (id, approve, comment) => {
    const res = await http.patch(`/api/leaves/${id}/process`, { approve, commentaire: comment })
    return res.data.data
  },

  cancelLeave: async (id) => {
    const res = await http.patch(`/api/leaves/${id}/cancel`)
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  ATTENDANCE (Pointage)
// ═══════════════════════════════════════════════
export const attendanceApi = {
  getAll: async () => {
    const res = await http.get('/api/attendance')
    return res.data.data
  },

  getMyAttendance: async () => {
    const res = await http.get('/api/attendance/me')
    return res.data.data
  },

  clock: async (type) => {
    // type: 'ARRIVEE' | 'DEPART'
    const res = await http.post('/api/attendance/clock', { type })
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  PAYROLL (Paie)
// ═══════════════════════════════════════════════
export const payrollApi = {
  getMyPayrolls: async () => {
    const res = await http.get('/api/payroll/me')
    return res.data.data
  },

  getByPeriod: async (mois, annee) => {
    const res = await http.get('/api/payroll/period', { params: { mois, annee } })
    return res.data.data
  },

  create: async (data) => {
    const res = await http.post('/api/payroll', data)
    return res.data.data
  },

  validate: async (id) => {
    const res = await http.patch(`/api/payroll/${id}/validate`)
    return res.data.data
  },

  calculate: async (idEmploye, mois, annee) => {
    const res = await http.get('/api/payroll/calculate', { params: { idEmploye, mois, annee } })
    return res.data.data
  },

  createBulk: async (data) => {
    const res = await http.post('/api/payroll/bulk', data)
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  ASSETS (Actifs IT)
// ═══════════════════════════════════════════════
export const assetApi = {
  getAll: async () => {
    const res = await http.get('/api/assets')
    return res.data.data
  },

  create: async (data) => {
    const res = await http.post('/api/assets', data)
    return res.data.data
  },

  getMyAssets: async () => {
    const res = await http.get('/api/assets/me')
    return res.data.data
  },

  assign: async (assetId, data) => {
    const res = await http.post(`/api/assets/${assetId}/assign`, data)
    return res.data.data
  },

  returnAsset: async (assetId, etatRetour) => {
    const res = await http.patch(`/api/assets/${assetId}/return`, null, {
      params: { etatRetour },
    })
    return res.data.data
  },

  getHistory: async (assetId) => {
    const res = await http.get(`/api/assets/${assetId}/history`)
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  EVALUATIONS
// ═══════════════════════════════════════════════
export const evaluationApi = {
  create: async (data) => {
    const res = await http.post('/api/evaluations', data)
    return res.data.data
  },

  getAll: async () => {
    const res = await http.get('/api/evaluations/all')
    return res.data.data
  },

  getByEmployee: async (employeeId) => {
    const res = await http.get(`/api/evaluations/employee/${employeeId}`)
    return res.data.data
  },

  getMyEvaluations: async () => {
    const res = await http.get('/api/evaluations/me')
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  EVALUATION PERIODS
// ═══════════════════════════════════════════════
export const evaluationPeriodApi = {
  getAll: async () => {
    const res = await http.get('/api/evaluation-periods')
    return res.data.data
  },

  create: async (data) => {
    const res = await http.post('/api/evaluation-periods', data)
    return res.data.data
  },

  close: async (id) => {
    const res = await http.patch(`/api/evaluation-periods/${id}/close`)
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  OBJECTIVES
// ═══════════════════════════════════════════════
export const objectiveApi = {
  getByPeriod: async (periodeId) => {
    const res = await http.get(`/api/objectives/periode/${periodeId}`)
    return res.data.data
  },

  create: async (data) => {
    const res = await http.post('/api/objectives', data)
    return res.data.data
  },

  delete: async (id) => {
    const res = await http.delete(`/api/objectives/${id}`)
    return res.data
  },
}

// ═══════════════════════════════════════════════
//  USERS (Account management — RH only)
// ═══════════════════════════════════════════════
export const userApi = {
  getAll: async () => {
    const res = await http.get('/api/users')
    return res.data.data
  },

  create: async (data) => {
    // data: { email, role, password } — backend expects tempPassword
    const res = await http.post('/api/users', {
      email: data.email,
      role: data.role,
      tempPassword: data.password,
    })
    return res.data.data
  },

  // Backend: PATCH /api/users/{id}/toggle-status
  toggleActive: async (id) => {
    const res = await http.patch(`/api/users/${id}/toggle-status`)
    return res.data.data
  },

  // Backend: PATCH /api/users/{id}/role?role=NEW_ROLE
  changeRole: async (id, role) => {
    const res = await http.patch(`/api/users/${id}/role`, null, { params: { role } })
    return res.data.data
  },

  // Backend: PATCH /api/users/{id}/reset-password
  resetPassword: async (id) => {
    const res = await http.patch(`/api/users/${id}/reset-password`)
    // Backend returns tempPwd as a String directly in data
    return { tempPassword: res.data.data }
  },

  uploadPhoto: async (userId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await http.post(`/api/users/${userId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════
export const notificationApi = {
  getAll: async () => {
    const res = await http.get('/api/notifications')
    return res.data.data
  },

  getUnreadCount: async () => {
    const res = await http.get('/api/notifications/unread-count')
    return res.data.data.count
  },

  markAsRead: async (id) => {
    const res = await http.patch(`/api/notifications/${id}/read`)
    return res.data.data
  },

  markAllAsRead: async () => {
    const res = await http.patch('/api/notifications/read-all')
    return res.data
  },

  sendDirect: async (idDestinataire, message) => {
    const res = await http.post('/api/notifications/direct', { idDestinataire, message })
    return res.data.data
  },

  sendBulk: async (recipientIds, message) => {
    const res = await http.post('/api/notifications/send-bulk', { recipientIds, message })
    return res.data
  },

  broadcast: async (message) => {
    const res = await http.post('/api/notifications/broadcast', { message })
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  LEAVES ADMIN (Configuration des congés)
// ═══════════════════════════════════════════════
export const leaveAdminApi = {
  getTypes: async () => {
    const res = await http.get('/api/leaves-admin/types')
    return res.data.data
  },

  addType: async (data) => {
    const res = await http.post('/api/leaves-admin/types', data)
    return res.data.data
  },

  updateType: async (data) => {
    const res = await http.patch('/api/leaves-admin/types', data)
    return res.data.data
  },
}

// ═══════════════════════════════════════════════
//  PROFILE CHANGE REQUESTS
// ═══════════════════════════════════════════════
export const profileChangeApi = {
  submitRequest: async (champsModifiesJson) => {
    const res = await http.post('/api/profile-changes', { champsModifies: champsModifiesJson })
    return res.data.data
  },

  getMyRequests: async () => {
    const res = await http.get('/api/profile-changes/me')
    return res.data.data
  },

  getPendingRequests: async () => {
    const res = await http.get('/api/profile-changes/pending')
    return res.data.data
  },

  processRequest: async (id, approve, comment) => {
    const res = await http.patch(`/api/profile-changes/${id}/process`, null, {
      params: { approve, comment }
    })
    return res.data.data
  }
}

// ═══════════════════════════════════════════════
//  DOCUMENTS
// ═══════════════════════════════════════════════
export const documentApi = {
  getByEmployee: async (employeeId) => {
    const res = await http.get(`/api/documents/employee/${employeeId}`)
    return res.data.data
  },

  upload: async (file, employeeId, typeDocument) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('employeeId', employeeId)
    formData.append('typeDocument', typeDocument)

    const res = await http.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },

  download: async (id, originalFilename) => {
    const res = await http.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', originalFilename)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
  },

  delete: async (id) => {
    const res = await http.delete(`/api/documents/${id}`)
    return res.data
  },
}

// ═══════════════════════════════════════════════
//  AUDIT LOGS
// ═══════════════════════════════════════════════
export const auditApi = {
  getAll: async () => {
    const res = await http.get('/api/audit')
    return res.data.data
  },
}


