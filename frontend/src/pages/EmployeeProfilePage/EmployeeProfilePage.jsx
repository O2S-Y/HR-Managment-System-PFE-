import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { employeeApi, profileChangeApi, documentApi, userApi } from '../../services/authApi'
import { getPhotoUrl } from '../../services/http'
import './employeeProfilePage.css'

function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z" />
    </svg>
  )
}

function IconUpload(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M5 20h14v-2H5v2Zm7-18L5.33 8.67l1.34 1.33L11 6.67V16h2V6.67l4.33 3.33 1.34-1.33L12 2Z" />
    </svg>
  )
}

function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" />
    </svg>
  )
}

function IconDoc(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm1 7V3.5L19.5 9H15Z"
      />
    </svg>
  )
}

function IconEdit(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
    </svg>
  )
}

function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
    </svg>
  )
}



export function EmployeeProfilePage() {
  const { employeeId } = useParams()
  const { user, updateUserPhoto } = useAuth()
  const isRH = user?.role === 'RH'
  const isOwner = user?.role === 'OWNER'
  const isEmployee = user?.role === 'EMPLOYE'
  const isSelf = employeeId === 'me'

  const [loading, setLoading] = useState(true)

  // Employee data state
  const [empData, setEmpData] = useState({
    id: '', userId: '', photoProfil: '', initials: '', name: '', title: '', dept: '', status: '',
    email: '', phone: '', cin: '', dob: '', address: '', contractType: '', hireDate: '',
    leave: { acquired: 0, used: 0, remaining: 0 },
    history: [], documents: [], userRole: 'EMPLOYE',
    salaireBase: 0,
    immatriculationCnss: '',
    nombreCharges: 0,
  })
  const [docs, setDocs] = useState([])

  // Fetch employee from API
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = isSelf || isEmployee
          ? await employeeApi.getMe()
          : await employeeApi.getById(employeeId)

        const name = data.nomComplet || data.name || '—'
        const parts = name.trim().split(/\s+/)
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase()

        let historyData = []
        try {
          historyData = isSelf || isEmployee
            ? await employeeApi.getMyHistory()
            : await employeeApi.getHistory(data.id)
        } catch (histErr) {
          console.error("Failed to load history", histErr)
        }

        const formattedHistory = (historyData ?? []).map(h => {
          const role = h.ancienPoste === h.nouveauPoste || !h.ancienPoste || h.ancienPoste === '—'
            ? h.nouveauPoste
            : `${h.ancienPoste} ➔ ${h.nouveauPoste}`
            
          const dept = h.ancienDepartement === h.nouveauDepartement || !h.ancienDepartement || h.ancienDepartement === '—'
            ? h.nouveauDepartement
            : `${h.ancienDepartement} ➔ ${h.nouveauDepartement}`

          const period = h.dateChangement
            ? `${new Date(h.dateChangement).toLocaleDateString()} (${h.motifChangement || 'Mise à jour'})`
            : h.motifChangement || ''

          return {
            role,
            dept,
            period
          }
        })

        setEmpData({
          id: data.id,
          userId: data.userId || '',
          photoProfil: data.photoProfil || '',
          initials,
          name,
          title: data.poste || '—',
          dept: data.departement || '—',
          status: data.statut || 'ACTIF',
          email: data.email || '—',
          phone: data.telephone || '—',
          cin: data.cin || '—',
          dob: data.dateNaissance || '—',
          address: data.adresse || '—',
          contractType: data.typeContrat || '—',
          hireDate: data.dateEmbauche || '—',
          leave: { 
            acquired: data.leaveAcquired ?? 0, 
            used: data.leaveUsed ?? 0, 
            remaining: data.leaveRemaining ?? 0 
          },
          history: formattedHistory,
          documents: [],
          userRole: data.userRole || 'EMPLOYE',
          salaireBase: data.salaireBase || 0,
          immatriculationCnss: data.immatriculationCnss || '—',
          nombreCharges: data.nombreCharges || 0,
        })
        setDocs([])
        try {
          const docsData = await documentApi.getByEmployee(data.id)
          setDocs(docsData ?? [])
        } catch (docErr) {
          console.error("Failed to load documents", docErr)
        }

        // Load profile change requests
        if (isEmployee) {
          const reqs = await profileChangeApi.getMyRequests()
          setChangeRequests(reqs ?? [])
        } else if (isRH) {
          const reqs = await profileChangeApi.getPendingRequests()
          const forThisEmp = (reqs ?? []).filter(r => r.employee?.id === data.id)
          setChangeRequests(forThisEmp)
        }
      } catch (err) {
        console.error('Failed to load employee', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [employeeId, isSelf, isEmployee, isRH])

  // Profile change request form state
  const [showChangeForm, setShowChangeForm] = useState(false)
  const [changeEmail, setChangeEmail] = useState('')
  const [changePhone, setChangePhone] = useState('')
  const [changeAddress, setChangeAddress] = useState('')
  const [changeRequests, setChangeRequests] = useState([])
  const [changeSubmitted, setChangeSubmitted] = useState(false)

  // RH: Archive confirmation
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  // RH: Edit mode
  const [showEditForm, setShowEditForm] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDept, setEditDept] = useState('')
  const [editContract, setEditContract] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSalaire, setEditSalaire] = useState('')
  const [editSoldeCongeAcquis, setEditSoldeCongeAcquis] = useState('')
  const [editImmatriculationCnss, setEditImmatriculationCnss] = useState('')
  const [editNombreCharges, setEditNombreCharges] = useState('')
  // RH: Upload document
  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)

  const handleAvatarClick = () => {
    if (isSelf || isEmployee || isRH) {
      photoInputRef.current?.click()
    }
  }

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const targetUserId = empData.userId || user.id
      const uploadedUrl = await userApi.uploadPhoto(targetUserId, file)
      setEmpData(prev => ({ ...prev, photoProfil: uploadedUrl }))
      
      const currentUserIsSelf = isSelf || isEmployee || String(empData.userId) === String(user.id)
      if (currentUserIsSelf) {
        updateUserPhoto(uploadedUrl)
      }
      alert("✅ Photo de profil mise à jour avec succès !")
    } catch (err) {
      console.error("Failed to upload photo", err)
      alert("Erreur lors du téléversement de la photo: " + (err.response?.data?.message || err.message))
    } finally {
      e.target.value = ''
    }
  }

  // Archive handler
  const handleArchive = async () => {
    try {
      await employeeApi.archive(empData.id)
      setEmpData(prev => ({ ...prev, status: 'ARCHIVE' }))
      alert("✅ Employé archivé avec succès !")
    } catch (err) {
      console.error('Failed to archive employee', err)
      alert("Erreur lors de l'archivage: " + (err.response?.data?.message || err.message))
    }
    setShowArchiveConfirm(false)
  }

  // Unarchive handler
  const handleUnarchive = async () => {
    try {
      await employeeApi.unarchive(empData.id)
      setEmpData(prev => ({ ...prev, status: 'ACTIF' }))
      alert("✅ Employé désarchivé avec succès !")
    } catch (err) {
      console.error('Failed to unarchive employee', err)
      alert("Erreur lors du désarchivage: " + (err.response?.data?.message || err.message))
    }
  }

  // Edit handler
  const handleEditSubmit = async (e) => {
    e.preventDefault()

    if (editPhone && editPhone.trim()) {
      const normalized = editPhone.trim().replace(/[\s\.\-\(\)]/g, '');
      if (!/^(?:0|\+212|00212)[567]\d{8}$/.test(normalized)) {
        alert('Le numéro de téléphone est invalide. Veuillez utiliser un format marocain valide (Ex: 0612345678 ou +212612345678).');
        return;
      }
    }

    const payload = {
      nomComplet: empData.name,
      cin: empData.cin === '—' ? '' : empData.cin,
      email: editEmail,
      telephone: editPhone,
      dateNaissance: empData.dob === '—' ? null : empData.dob,
      adresse: empData.address === '—' ? '' : empData.address,
      departement: editDept,
      poste: editTitle,
      typeContrat: editContract,
      dateEmbauche: empData.hireDate === '—' ? null : empData.hireDate,
      dateFinContrat: null,
      statut: empData.status,
      salaireBase: editSalaire ? Number(editSalaire) : 0,
      soldeCongeAcquis: editSoldeCongeAcquis ? Number(editSoldeCongeAcquis) : null,
      immatriculationCnss: editImmatriculationCnss,
      nombreCharges: Number(editNombreCharges) || 0,
    }

    try {
      const updated = await employeeApi.update(empData.id, payload)
      const name = updated.nomComplet || updated.name || '—'
      const parts = name.trim().split(/\s+/)
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase()

      // Fetch history again to show updated list
      let historyData = []
      try {
        historyData = isSelf || isEmployee
          ? await employeeApi.getMyHistory()
          : await employeeApi.getHistory(updated.id)
      } catch (histErr) {
        console.error("Failed to load history", histErr)
      }

      const formattedHistory = (historyData ?? []).map(h => {
        const role = h.ancienPoste === h.nouveauPoste || !h.ancienPoste || h.ancienPoste === '—'
          ? h.nouveauPoste
          : `${h.ancienPoste} ➔ ${h.nouveauPoste}`
          
        const dept = h.ancienDepartement === h.nouveauDepartement || !h.ancienDepartement || h.ancienDepartement === '—'
          ? h.nouveauDepartement
          : `${h.ancienDepartement} ➔ ${h.nouveauDepartement}`

        const period = h.dateChangement
          ? `${new Date(h.dateChangement).toLocaleDateString()} (${h.motifChangement || 'Mise à jour'})`
          : h.motifChangement || ''

        return {
          role,
          dept,
          period
        }
      })

      setEmpData(prev => ({
        ...prev,
        initials,
        name,
        title: updated.poste || '—',
        dept: updated.departement || '—',
        status: updated.statut || 'ACTIF',
        email: updated.email || '—',
        phone: updated.telephone || '—',
        cin: updated.cin || '—',
        dob: updated.dateNaissance || '—',
        address: updated.adresse || '—',
        contractType: updated.typeContrat || '—',
        hireDate: updated.dateEmbauche || '—',
        history: formattedHistory,
        userRole: updated.userRole || prev.userRole,
        salaireBase: updated.salaireBase || 0,
        immatriculationCnss: updated.immatriculationCnss || '—',
        nombreCharges: updated.nombreCharges || 0,
        leave: {
          acquired: updated.leaveAcquired ?? 0,
          used: updated.leaveUsed ?? 0,
          remaining: updated.leaveRemaining ?? 0
        }
      }))
      setShowEditForm(false)
      alert("✅ Profil mis à jour avec succès !")
    } catch (err) {
      console.error('Failed to update employee', err)
      alert("Erreur lors de la mise à jour : " + (err.response?.data?.message || err.message))
    }
  }

  // Document upload handler
  const handleUpload = () => {
    fileInputRef.current?.click()
  }
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const typeDocument = document.getElementById("doc-type-select")?.value || "AUTRE"

    try {
      await documentApi.upload(file, empData.id, typeDocument)
      alert("✅ Document téléversé avec succès !")
      // Reload documents
      const docsData = await documentApi.getByEmployee(empData.id)
      setDocs(docsData ?? [])
    } catch (err) {
      console.error("Failed to upload document", err)
      alert("Erreur lors du téléversement du document: " + (err.response?.data?.message || err.message))
    } finally {
      e.target.value = ''
    }
  }

  const handleChangeSubmit = async (e) => {
    e.preventDefault()

    if (changePhone && changePhone.trim()) {
      const normalized = changePhone.trim().replace(/[\s\.\-\(\)]/g, '');
      if (!/^(?:0|\+212|00212)[567]\d{8}$/.test(normalized)) {
        alert('Le numéro de téléphone est invalide. Veuillez utiliser un format marocain valide (Ex: 0612345678 ou +212612345678).');
        return;
      }
    }

    const updates = {}
    if (changeEmail !== empData.email) updates.email = changeEmail
    if (changePhone !== empData.phone) updates.telephone = changePhone
    if (changeAddress !== empData.address) updates.adresse = changeAddress

    if (Object.keys(updates).length === 0) {
      alert("Aucune modification détectée.")
      return
    }

    try {
      await profileChangeApi.submitRequest(JSON.stringify(updates))
      // Reload requests list
      if (isEmployee) {
        const reqs = await profileChangeApi.getMyRequests()
        setChangeRequests(reqs ?? [])
      }
      
      setShowChangeForm(false)
      setChangeSubmitted(true)
      setTimeout(() => setChangeSubmitted(false), 4000)
    } catch (err) {
      console.error('Failed to submit profile change request', err)
      alert("Erreur lors de la soumission de la demande: " + (err.response?.data?.message || err.message))
    }
  }

  return (
    <AppShell
      header={
        <TopBar
          center={
            <div className="tabs">
              <button className="tab tabActive" type="button">
                Annuaire
              </button>
            </div>
          }
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
        />
      }
    >
      {loading ? (
        <div className="profilePage" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: '#8a9bb0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
            <div>Chargement du profil…</div>
          </div>
        </div>
      ) : (
      <div className="profilePage">
        <div className="crumbs">
          <Link className="crumbLink" to="/employees">
            Employés
          </Link>
          <span className="crumbSep">›</span>
          <span className="crumbCurrent">{empData.name}</span>
          <span className="crumbId">({employeeId})</span>
        </div>

        <section className="profileHeader">
          <input
            type="file"
            ref={photoInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handlePhotoSelected}
          />
          <div 
            className="avatarBig" 
            aria-hidden="true" 
            onClick={handleAvatarClick}
            style={{ cursor: (isSelf || isEmployee || isRH) ? 'pointer' : 'default' }}
          >
            {empData.photoProfil ? (
              <img src={getPhotoUrl(empData.photoProfil)} alt={empData.name} className="avatarBigImg" />
            ) : (
              empData.initials
            )}
            {(isSelf || isEmployee || isRH) && (
              <div className="avatarBigHover">
                <IconUpload />
              </div>
            )}
          </div>
          <div className="headMeta">
            <div className="headRow">
              <h1 className="headName">{empData.name}</h1>
              <span className={`badgeStatus ${empData.status === 'ARCHIVE' ? 'badgeStatusArchived' : ''}`}>
                {empData.status === 'ACTIF' ? 'Actif' : empData.status === 'ARCHIVE' ? 'Archivé' : empData.status}
              </span>
            </div>
            <div className="headTitle">{empData.title}</div>
            <div className="headDept">{empData.dept}</div>
          </div>

          {/* M1_UC3: Archiver + M1_UC1: Modifier — RH and OWNER permissions */}
          {((isRH && empData.userRole === 'EMPLOYE') || (isOwner && empData.userRole !== 'OWNER')) && (
            <div className="headActions">
              {empData.status !== 'ARCHIVE' ? (
                <button className="linkBtn" type="button" onClick={() => setShowArchiveConfirm(true)}>
                  Archiver
                </button>
              ) : (
                <button className="linkBtn" type="button" onClick={handleUnarchive} style={{ color: '#27ae60' }}>
                  Désarchiver
                </button>
              )}
              {isRH && (
                <button className="outlineBtn" type="button" onClick={() => {
                  setEditTitle(empData.title)
                  setEditDept(empData.dept)
                  setEditContract(empData.contractType)
                  setEditEmail(empData.email)
                  setEditPhone(empData.phone)
                  setEditSalaire(empData.salaireBase || '')
                  setEditSoldeCongeAcquis(empData.leave.acquired ?? '')
                  setEditImmatriculationCnss(empData.immatriculationCnss === '—' ? '' : empData.immatriculationCnss)
                  setEditNombreCharges(empData.nombreCharges ?? 0)
                  setShowEditForm(true)
                }}>
                  Modifier
                </button>
              )}
            </div>
          )}

          {/* M1_UC9: Employee requests profile change */}
          {isEmployee && (
            <div className="headActions">
              <button
                className="outlineBtn profChangeBtn"
                type="button"
                onClick={() => {
                  setChangeEmail(empData.email !== '—' ? empData.email : '')
                  setChangePhone(empData.phone !== '—' ? empData.phone : '')
                  setChangeAddress(empData.address !== '—' ? empData.address : '')
                  setShowChangeForm(!showChangeForm)
                }}
              >
                <IconEdit />
                Modifier mes infos
              </button>
            </div>
          )}
        </section>

        {/* RH: Pending profile changes section */}
        {isRH && changeRequests.length > 0 && (
          <section className="profChangeHistory" style={{ marginBottom: '2rem', border: '1px solid #f39c12' }}>
            <div className="profChangeHistoryTitle" style={{ color: '#f39c12', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f39c12' }} />
              Demandes de modification de profil en attente
            </div>
            <div className="profChangeTableWrap">
              <table className="profChangeTable">
                <thead>
                  <tr>
                    <th>Date soumission</th>
                    <th>Changements demandés</th>
                    <th>Commentaire RH (Optionnel)</th>
                    <th className="profThRight">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {changeRequests.map((req) => {
                    let parsedFields = {}
                    try {
                      parsedFields = JSON.parse(req.champsModifies)
                    } catch (e) {
                      console.error("Failed to parse request JSON", e)
                    }
                    const fieldLines = Object.entries(parsedFields).map(([key, val]) => {
                      const labelMap = {
                        email: 'Email',
                        telephone: 'Téléphone',
                        cin: 'CIN',
                        dateNaissance: 'Date de naissance',
                        adresse: 'Adresse'
                      }
                      return `${labelMap[key] || key} : ${val}`
                    }).join(', ')

                    return (
                      <tr key={req.id}>
                        <td className="profChangeTdMono">{req.dateSoumission ? req.dateSoumission.split('T')[0] : '—'}</td>
                        <td>{fieldLines || req.champsModifies}</td>
                        <td>
                          <input 
                            type="text" 
                            id={`comment-rh-${req.id}`}
                            className="profChangeInput" 
                            placeholder="ex: Vérifié en personne..." 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          />
                        </td>
                        <td className="profChangeThRight" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="profBtnPrimary"
                            type="button"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#27ae60', borderColor: '#27ae60' }}
                            onClick={async () => {
                              const comment = document.getElementById(`comment-rh-${req.id}`)?.value || ''
                              try {
                                await profileChangeApi.processRequest(req.id, true, comment)
                                alert("✅ Demande approuvée avec succès ! Les modifications ont été appliquées au profil.")
                                window.location.reload()
                              } catch (err) {
                                console.error(err)
                                alert("Erreur lors de l'approbation : " + (err.response?.data?.message || err.message))
                              }
                            }}
                          >
                            Approuver
                          </button>
                          <button 
                            className="profBtnDanger"
                            type="button"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={async () => {
                              const comment = document.getElementById(`comment-rh-${req.id}`)?.value || ''
                              if (!comment.trim()) {
                                alert("Un commentaire est obligatoire en cas de refus.")
                                return
                              }
                              try {
                                await profileChangeApi.processRequest(req.id, false, comment)
                                alert("❌ Demande refusée.")
                                window.location.reload()
                              } catch (err) {
                                console.error(err)
                                alert("Erreur lors du refus : " + (err.response?.data?.message || err.message))
                              }
                            }}
                          >
                            Refuser
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RH: Archive confirmation modal */}
        {showArchiveConfirm && (
          <div className="profOverlay" onClick={() => setShowArchiveConfirm(false)}>
            <div className="profModal profModalSm" onClick={e => e.stopPropagation()}>
              <div className="profModalHeader">
                <h3 className="profModalTitle">Archiver l'employé ?</h3>
                <button className="profModalClose" onClick={() => setShowArchiveConfirm(false)}><IconClose /></button>
              </div>
              <div className="profModalBody">
                <p>Cette action va archiver le profil de <strong>{empData.name}</strong>. L'employé ne sera plus actif dans le système.</p>
              </div>
              <div className="profModalFooter">
                <button className="profBtnSecondary" onClick={() => setShowArchiveConfirm(false)}>Annuler</button>
                <button className="profBtnDanger" onClick={handleArchive}>Confirmer l'archivage</button>
              </div>
            </div>
          </div>
        )}

        {/* RH: Edit employee modal */}
        {showEditForm && (
          <div className="profOverlay" onClick={() => setShowEditForm(false)}>
            <div className="profModal" onClick={e => e.stopPropagation()}>
              <div className="profModalHeader">
                <h3 className="profModalTitle">Modifier les informations</h3>
                <button className="profModalClose" onClick={() => setShowEditForm(false)}><IconClose /></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="profModalBody">
                  <label className="profFieldGroup">
                    <span className="profLabel">Poste</span>
                    <input className="profInput" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  </label>
                  <label className="profFieldGroup">
                    <span className="profLabel">Département</span>
                    <input className="profInput" value={editDept} onChange={e => setEditDept(e.target.value)} />
                  </label>
                  <label className="profFieldGroup">
                    <span className="profLabel">Type de contrat</span>
                    <select className="profInput" value={editContract} onChange={e => setEditContract(e.target.value)}>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="STAGE">Stage</option>
                      <option value="INTERIM">Intérim</option>
                    </select>
                  </label>
                  <label className="profFieldGroup">
                    <span className="profLabel">Email</span>
                    <input className="profInput" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                  </label>
                  <label className="profFieldGroup">
                    <span className="profLabel">Téléphone</span>
                    <input className="profInput" value={editPhone} onChange={e => {
                      const val = e.target.value;
                      if (/^[0-9\s\+\-\.\(\)]*$/.test(val) && val.replace(/\D/g, '').length <= 14) {
                        setEditPhone(val);
                      }
                    }} />
                  </label>
                  <label className="profFieldGroup">
                    <span className="profLabel">Salaire de base (MAD)</span>
                    <input className="profInput" type="number" step="0.01" value={editSalaire} onChange={e => setEditSalaire(e.target.value)} />
                  </label>
                  <label className="profFieldGroup">
                    <span className="profLabel">N° d'immatriculation CNSS</span>
                    <input className="profInput" value={editImmatriculationCnss} onChange={e => setEditImmatriculationCnss(e.target.value)} />
                  </label>
                  <label className="profFieldGroup">
                    <span className="profLabel">Nombre de charges</span>
                    <input className="profInput" type="number" min="0" max="6" value={editNombreCharges} onChange={e => setEditNombreCharges(e.target.value)} />
                  </label>
                  {empData.userRole !== 'OWNER' && (
                    <label className="profFieldGroup">
                      <span className="profLabel">Solde de congés acquis (jours)</span>
                      <input className="profInput" type="number" step="0.5" value={editSoldeCongeAcquis} onChange={e => setEditSoldeCongeAcquis(e.target.value)} />
                    </label>
                  )}
                </div>
                <div className="profModalFooter">
                  <button className="profBtnSecondary" type="button" onClick={() => setShowEditForm(false)}>Annuler</button>
                  <button className="profBtnPrimary" type="submit">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success notification */}
        {changeSubmitted && (
          <div className="profChangeSuccess">
            <IconCheck />
            Demande de modification soumise ! RH va vérifier et approuver vos changements.
          </div>
        )}

        {/* Profile change form — Employee only */}
        {isEmployee && showChangeForm && (
          <section className="profChangeFormCard">
            <div className="profChangeFormTitle">
              <IconEdit />
              Demander une modification de mes informations
            </div>
            <div className="profChangeNote">
              Modifiez les champs ci-dessous. Votre demande sera envoyée à RH pour vérification en personne avant approbation.
            </div>
            <form className="profChangeForm" onSubmit={handleChangeSubmit}>
              <div className="profChangeRow">
                <label className="profChangeLabel">
                  Email
                  <input
                    type="email"
                    className="profChangeInput"
                    value={changeEmail}
                    onChange={(e) => setChangeEmail(e.target.value)}
                  />
                </label>
                <label className="profChangeLabel">
                  Téléphone
                  <input
                    type="text"
                    className="profChangeInput"
                    value={changePhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[0-9\s\+\-\.\(\)]*$/.test(val) && val.replace(/\D/g, '').length <= 14) {
                        setChangePhone(val);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="profChangeRow profChangeRowFull">
                <label className="profChangeLabel">
                  Adresse
                  <input
                    type="text"
                    className="profChangeInput"
                    value={changeAddress}
                    onChange={(e) => setChangeAddress(e.target.value)}
                  />
                </label>
              </div>
              <div className="profChangeActions">
                <button type="button" className="profChangeCancelBtn" onClick={() => setShowChangeForm(false)}>
                  Annuler
                </button>
                <button type="submit" className="profChangeSubmitBtn">
                  <IconCheck />
                  Soumettre la demande
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Profile change request history — Employee only */}
        {isEmployee && changeRequests.length > 0 && (
          <section className="profChangeHistory">
            <div className="profChangeHistoryTitle">Mes demandes de modification</div>
            <div className="profChangeTableWrap">
              <table className="profChangeTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Champs modifiés</th>
                    <th className="profChangeThRight">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {changeRequests.map((r) => {
                    let parsedFields = {}
                    try {
                      parsedFields = JSON.parse(r.champsModifies)
                    } catch (e) {
                      console.error("Failed to parse request JSON", e)
                    }
                    const fieldLines = Object.entries(parsedFields).map(([key, val]) => {
                      const labelMap = {
                        email: 'Email',
                        telephone: 'Téléphone',
                        cin: 'CIN',
                        dateNaissance: 'Date de naissance',
                        adresse: 'Adresse'
                      }
                      return `${labelMap[key] || key} : ${val}`
                    }).join(', ')

                    return (
                      <tr key={r.id}>
                        <td className="profChangeTdMono">{r.dateSoumission ? r.dateSoumission.split('T')[0] : '—'}</td>
                        <td>
                          <div>{fieldLines || r.champsModifies}</div>
                          {r.commentaireRh && (
                            <div style={{ fontSize: '0.75rem', color: '#e74c3c', marginTop: '4px' }}>
                              Note RH: {r.commentaireRh}
                            </div>
                          )}
                        </td>
                        <td className="profChangeThRight">
                          {r.statut === 'APPROUVE' && (
                            <span className="profChangePill profChangePillApproved">Approuvée</span>
                          )}
                          {r.statut === 'EN_ATTENTE' && (
                            <span className="profChangePill profChangePillPending">En attente</span>
                          )}
                          {r.statut === 'REFUSE' && (
                            <span className="profChangePill profChangePillRejected">Refusée</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="grid2">
          <div className="leftCol">
            <div className="block">
              <div className="blockTitle">INFORMATIONS PERSONNELLES</div>
              <div className="infoGrid">
                <div className="infoItem">
                  <div className="infoLabel">EMAIL</div>
                  <div className="infoValue">{empData.email}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">T\u00c9L\u00c9PHONE</div>
                  <div className="infoValue">{empData.phone}</div>
                </div>
                 <div className="infoItem">
                   <div className="infoLabel">CIN</div>
                   <div className="infoValue">{empData.cin}</div>
                 </div>
                 <div className="infoItem">
                   <div className="infoLabel">N° D'IMMATRICULATION CNSS</div>
                   <div className="infoValue">{empData.immatriculationCnss}</div>
                 </div>
                 <div className="infoItem">
                   <div className="infoLabel">DATE DE NAISSANCE</div>
                   <div className="infoValue">{empData.dob}</div>
                 </div>
                 <div className="infoItem">
                   <div className="infoLabel">NOMBRE DE CHARGES</div>
                   <div className="infoValue">{empData.nombreCharges}</div>
                 </div>
                <div className="infoItem infoWide">
                  <div className="infoLabel">ADRESSE</div>
                  <div className="infoValue">{empData.address}</div>
                </div>
              </div>
            </div>

            <div className="block">
              <div className="blockTitle">POSTE &amp; CONTRAT</div>
              <div className="infoGrid">
                <div className="infoItem">
                  <div className="infoLabel">POSTE</div>
                  <div className="infoValue">{empData.title}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">D\u00c9PARTEMENT</div>
                  <div className="infoValue">{empData.dept}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">TYPE DE CONTRAT</div>
                  <div className="infoValue">{empData.contractType}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">{`DATE D'EMBAUCHE`}</div>
                  <div className="infoValue">{empData.hireDate}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">SALAIRE DE BASE</div>
                  <div className="infoValue">{empData.salaireBase ? `${empData.salaireBase} MAD` : '—'}</div>
                </div>
              </div>
            </div>

            <div className="block">
              <div className="blockTitle">HISTORIQUE DES POSTES</div>
              <div className="timeline">
                {empData.history.map((h, idx) => (
                  <div key={idx} className="timeRow">
                    <span className="timeDot" />
                    <div className="timeMeta">
                      <div className="timeRole">{h.role}</div>
                      <div className="timeSub">
                        {h.dept} • {h.period}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rightCol">
            <div className="block">
              <div className="blockHead">
                <div className="blockTitle">DOCUMENTS RH</div>
                {/* M1_UC4: Gérer les documents RH — RH only, blocked for OWNER */}
                {isRH && empData.userRole !== 'OWNER' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select id="doc-type-select" className="profInput" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <option value="CONTRAT">Contrat</option>
                      <option value="CIN">CIN</option>
                      <option value="DIPLOME">Diplôme</option>
                      <option value="ATTESTATION">Attestation</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelected} accept=".pdf,.doc,.docx,.jpg,.png" />
                    <button className="uploadBtn" type="button" onClick={handleUpload}>
                      <IconUpload /> Téléverser
                    </button>
                  </div>
                )}
              </div>
              <div className="docs">
                {docs.map((d) => (
                  <div key={d.id} className="docRow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                      onClick={() => {
                        documentApi.download(d.id, d.nomFichierOriginal)
                          .catch(err => {
                            console.error(err)
                            alert("Erreur lors du téléchargement.")
                          })
                      }}
                      title="Cliquez pour télécharger"
                    >
                      <IconDoc className="docIcon" />
                      <div className="docMeta">
                        <div className="docName" style={{ fontWeight: '600', color: 'var(--accent)' }}>
                          {d.nomFichierOriginal}
                        </div>
                        <div className="docDate">
                          Type: {d.typeDocument} • Déposé le {d.dateDepot ? d.dateDepot.split('T')[0] : '—'}
                        </div>
                      </div>
                    </div>
                    {isRH && empData.userRole !== 'OWNER' && (
                      <button 
                        className="docDeleteBtn" 
                        type="button" 
                        title="Supprimer" 
                        onClick={async () => {
                          if (confirm(`Voulez-vous vraiment supprimer le document "${d.nomFichierOriginal}" ?`)) {
                            try {
                              await documentApi.delete(d.id)
                              alert("✅ Document supprimé avec succès !")
                              // Reload documents
                              const docsData = await documentApi.getByEmployee(empData.id)
                              setDocs(docsData ?? [])
                            } catch (err) {
                              console.error(err)
                              alert("Erreur lors de la suppression.")
                            }
                          }
                        }}
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                ))}
                {docs.length === 0 && (
                  <div style={{ padding: '1rem', color: '#8a9bb0', fontSize: '0.85rem', textAlign: 'center' }}>
                    Aucun document déposé.
                  </div>
                )}
              </div>
            </div>

            {empData.userRole !== 'OWNER' && (
              <div className="block">
                <div className="blockTitle">SOLDE DE CONGÉS</div>
                <div className="leaveGrid">
                  <div className="leaveItem">
                    <div className="leaveValue">{empData.leave.acquired}</div>
                    <div className="leaveLabel">ACQUIS</div>
                  </div>
                  <div className="leaveItem">
                    <div className="leaveValue">{empData.leave.used}</div>
                    <div className="leaveLabel">PRIS</div>
                  </div>
                  <div className="leaveItem">
                    <div className="leaveValue leaveValueAccent">{empData.leave.remaining}</div>
                    <div className="leaveLabel leaveLabelAccent">RESTANT</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      )}
    </AppShell>
  )
}
