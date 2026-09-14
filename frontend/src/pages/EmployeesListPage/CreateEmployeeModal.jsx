import { useEffect, useMemo, useState } from 'react'
import { employeeApi } from '../../services/authApi'
import './createEmployeeModal.css'

const TYPE_CONTRAT_OPTIONS = [
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'STAGE', label: 'Stage' },
  { value: 'INTERIM', label: 'Intérim' },
]

const STATUT_OPTIONS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'ARCHIVE', label: 'Archivé' },
]

function initialsFromFullName(name) {
  if (!name || typeof name !== 'string') return '—'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function toHumanDate(isoDate) {
  if (!isoDate) return ''
  try {
    const d = new Date(isoDate)
    if (Number.isNaN(d.getTime())) return isoDate
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return isoDate
  }
}

export function CreateEmployeeModal({ open, onClose, onCreate, editingEmployee, onUpdate }) {
  const [nomComplet, setNomComplet] = useState('')
  const [cin, setCin] = useState('')
  const [immatriculationCnss, setImmatriculationCnss] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [adresse, setAdresse] = useState('')
  const [departement, setDepartement] = useState('')
  const [poste, setPoste] = useState('')
  const [typeContrat, setTypeContrat] = useState('CDI')
  const [dateEmbauche, setDateEmbauche] = useState('')
  const [dateFinContrat, setDateFinContrat] = useState('')
  const [statut, setStatut] = useState('ACTIF')
  const [salaireBase, setSalaireBase] = useState('')
  const [nombreCharges, setNombreCharges] = useState(0)
  const [error, setError] = useState('')

  const isEdit = !!editingEmployee

  const requiresEndDate = typeContrat !== 'CDI'

  const maxBirthDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const canSubmit = useMemo(() => {
    if (!nomComplet.trim()) return false
    if (!cin.trim()) return false
    if (!departement.trim()) return false
    if (!poste.trim()) return false
    if (!typeContrat) return false
    if (!dateEmbauche) return false
    if (!statut) return false
    if (requiresEndDate && !dateFinContrat) return false
    return true
  }, [nomComplet, cin, departement, poste, typeContrat, dateEmbauche, statut, requiresEndDate, dateFinContrat])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setError('')
    if (editingEmployee) {
      setNomComplet(editingEmployee.nomComplet || editingEmployee.name || '')
      setCin(editingEmployee.cin || editingEmployee._domain?.cin || '')
      setImmatriculationCnss(editingEmployee.immatriculationCnss || editingEmployee._domain?.immatriculationCnss || '')
      setEmail(editingEmployee.email || editingEmployee._domain?.email || '')
      setTelephone(editingEmployee.telephone || editingEmployee._domain?.telephone || '')
      setDateNaissance(editingEmployee.dateNaissance || editingEmployee._domain?.dateNaissance || '')
      setAdresse(editingEmployee.adresse || editingEmployee._domain?.adresse || '')
      setDepartement(editingEmployee.departement || editingEmployee.dept || '')
      setPoste(editingEmployee.poste || editingEmployee.role || '')
      setTypeContrat(editingEmployee.typeContrat || editingEmployee._domain?.typeContrat || 'CDI')
      setDateEmbauche(editingEmployee.dateEmbauche || editingEmployee._domain?.dateEmbauche || '')
      setDateFinContrat(editingEmployee.dateFinContrat || editingEmployee._domain?.dateFinContrat || '')
      setStatut(editingEmployee.statut || (editingEmployee.status === 'Actif' ? 'ACTIF' : 'ARCHIVE'))
      setSalaireBase(editingEmployee.salaireBase || '')
      setNombreCharges(editingEmployee.nombreCharges || 0)
    } else {
      setNomComplet('')
      setCin('')
      setImmatriculationCnss('')
      setEmail('')
      setTelephone('')
      setDateNaissance('')
      setAdresse('')
      setDepartement('')
      setPoste('')
      setTypeContrat('CDI')
      setDateEmbauche('')
      setDateFinContrat('')
      setStatut('ACTIF')
      setSalaireBase('')
      setNombreCharges(0)
    }
  }, [open, editingEmployee])

  useEffect(() => {
    if (typeContrat === 'CDI') {
      setDateFinContrat('')
    }
  }, [typeContrat])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) {
      setError('Veuillez remplir tous les champs requis.')
      return
    }

    if (telephone.trim()) {
      const normalized = telephone.trim().replace(/[\s\.\-\(\)]/g, '');
      if (!/^(?:0|\+212|00212)[567]\d{8}$/.test(normalized)) {
        setError('Le numéro de téléphone est invalide. Veuillez utiliser un format marocain valide (Ex: 0612345678 ou +212612345678).');
        return;
      }
    }

    if (dateNaissance) {
      const birthDate = new Date(dateNaissance);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setError('L’employé doit être âgé d’au moins 18 ans.');
        return;
      }
    }

    const payload = {
      nomComplet: nomComplet.trim(),
      cin: cin.trim(),
      immatriculationCnss: immatriculationCnss.trim() || null,
      email: email.trim(),
      telephone: telephone.trim(),
      dateNaissance: dateNaissance || null,
      adresse: adresse.trim(),
      departement: departement.trim(),
      poste: poste.trim(),
      typeContrat,
      dateEmbauche: dateEmbauche || null,
      dateFinContrat: requiresEndDate && dateFinContrat ? dateFinContrat : null,
      statut,
      salaireBase: salaireBase ? Number(salaireBase) : 0,
      nombreCharges: Number(nombreCharges) || 0,
    }

    try {
      if (isEdit) {
        const updated = await employeeApi.update(editingEmployee.id, payload)
        onUpdate(updated)
      } else {
        const created = await employeeApi.create(payload)
        onCreate(created)
      }
      onClose()
    } catch (err) {
      console.error('Failed to save employee', err)
      setError(err?.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  return (
    <div className="cemOverlay" role="dialog" aria-label="Ajouter un employé" aria-modal="true">
      <button className="cemBackdrop" type="button" aria-label="Fermer" onClick={onClose} />

      <section className="cemPanel" aria-label="Formulaire d'ajout d'un employé">
        <header className="cemHead">
          <div className="cemTitleBlock">
            <div className="cemTitle">{isEdit ? 'Modifier l\'employ\u00e9' : 'Ajouter un employ\u00e9'}</div>
            <div className="cemSubtitle">{isEdit ? 'Modifiez les informations de l\'employ\u00e9' : 'Renseignez les informations du nouvel employ\u00e9'}</div>
          </div>
          <button className="cemClose" type="button" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        <form className="cemBody" onSubmit={handleSubmit}>
          <div className="cemGrid">
            <label className="cemField">
              <span className="cemLabel">Nom complet</span>
              <input className="cemInput" value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} placeholder="Ex: Amine El Idrissi" />
            </label>

            <label className="cemField">
              <span className="cemLabel">CIN</span>
              <input className="cemInput" value={cin} onChange={(e) => setCin(e.target.value)} placeholder="Ex: AB123456" />
            </label>

            <label className="cemField">
              <span className="cemLabel">N° d'immatriculation CNSS</span>
              <input className="cemInput" value={immatriculationCnss} onChange={(e) => setImmatriculationCnss(e.target.value)} placeholder="Ex: 1234567890" />
            </label>

            <label className="cemField">
              <span className="cemLabel">Email</span>
              <input className="cemInput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: a.elidrissi@newdev.ma" />
            </label>

            <label className="cemField">
              <span className="cemLabel">Téléphone</span>
              <input className="cemInput" value={telephone} onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9\s\+\-\.\(\)]*$/.test(val) && val.replace(/\D/g, '').length <= 14) {
                  setTelephone(val);
                }
              }} placeholder="Ex: +212 6 00 00 00 00" />
            </label>

            <label className="cemField">
              <span className="cemLabel">Date de naissance</span>
              <input className="cemInput" type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} max={maxBirthDate} />
            </label>

            <label className="cemField" style={{ gridColumn: '1 / -1' }}>
              <span className="cemLabel">Adresse</span>
              <input className="cemInput" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Ex: 123 Rue de la Libert\u00e9, Casablanca" />
            </label>

            <label className="cemField">
              <span className="cemLabel">Département</span>
              <input className="cemInput" value={departement} onChange={(e) => setDepartement(e.target.value)} placeholder="Ex: Engineering" />
            </label>

            <label className="cemField">
              <span className="cemLabel">Poste</span>
              <input className="cemInput" value={poste} onChange={(e) => setPoste(e.target.value)} placeholder="Ex: Développeur Full-Stack" />
            </label>

            <label className="cemField">
              <span className="cemLabel">Type de contrat</span>
              <select className="cemInput" value={typeContrat} onChange={(e) => setTypeContrat(e.target.value)}>
                {TYPE_CONTRAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="cemField">
              <span className="cemLabel">Statut</span>
              <select className="cemInput" value={statut} onChange={(e) => setStatut(e.target.value)}>
                {STATUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="cemField">
              <span className="cemLabel">Salaire de base (MAD)</span>
              <input
                className="cemInput"
                type="number"
                step="0.01"
                value={salaireBase}
                onChange={(e) => setSalaireBase(e.target.value)}
                placeholder="Ex: 8000"
              />
            </label>

            <label className="cemField">
              <span className="cemLabel">Nombre de charges</span>
              <input
                className="cemInput"
                type="number"
                min="0"
                max="6"
                value={nombreCharges}
                onChange={(e) => setNombreCharges(e.target.value)}
                placeholder="Ex: 2"
              />
            </label>

            <label className="cemField">
              <span className="cemLabel">Date d'embauche</span>
              <input className="cemInput" type="date" value={dateEmbauche} onChange={(e) => setDateEmbauche(e.target.value)} />
            </label>

            <label className={requiresEndDate ? 'cemField' : 'cemField cemFieldDisabled'}>
              <span className="cemLabel">Date fin de contrat</span>
              <input
                className="cemInput"
                type="date"
                value={dateFinContrat}
                onChange={(e) => setDateFinContrat(e.target.value)}
                disabled={!requiresEndDate}
              />
            </label>
          </div>

          {error ? (
            <div className="cemError" role="alert">
              {error}
            </div>
          ) : null}

          <footer className="cemFooter">
            <button className="cemSecondary" type="button" onClick={onClose}>
              Annuler
            </button>
            <button className="cemPrimary" type="submit" disabled={!canSubmit}>
              {isEdit ? 'Enregistrer les modifications' : 'Créer l’employé'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

