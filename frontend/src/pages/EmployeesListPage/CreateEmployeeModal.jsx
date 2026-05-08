import { useEffect, useMemo, useState } from 'react'
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

export function CreateEmployeeModal({ open, onClose, onCreate }) {
  const [nomComplet, setNomComplet] = useState('')
  const [cin, setCin] = useState('')
  const [departement, setDepartement] = useState('')
  const [poste, setPoste] = useState('')
  const [typeContrat, setTypeContrat] = useState('CDI')
  const [dateEmbauche, setDateEmbauche] = useState('')
  const [dateFinContrat, setDateFinContrat] = useState('')
  const [statut, setStatut] = useState('ACTIF')
  const [error, setError] = useState('')

  const requiresEndDate = typeContrat !== 'CDI'

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
  }, [open])

  useEffect(() => {
    if (typeContrat === 'CDI') {
      setDateFinContrat('')
    }
  }, [typeContrat])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) {
      setError('Veuillez remplir tous les champs requis.')
      return
    }

    const payload = {
      nomComplet: nomComplet.trim(),
      cin: cin.trim(),
      departement: departement.trim(),
      poste: poste.trim(),
      typeContrat,
      dateEmbauche,
      dateFinContrat: requiresEndDate ? dateFinContrat : null,
      statut,
    }

    onCreate({
      id: String(Date.now()),
      initials: initialsFromFullName(payload.nomComplet),
      name: payload.nomComplet,
      role: payload.poste,
      dept: payload.departement,
      hired: toHumanDate(payload.dateEmbauche),
      status: payload.statut === 'ACTIF' ? 'Actif' : 'Inactif',
      _domain: payload,
    })

    onClose()
    setNomComplet('')
    setCin('')
    setDepartement('')
    setPoste('')
    setTypeContrat('CDI')
    setDateEmbauche('')
    setDateFinContrat('')
    setStatut('ACTIF')
  }

  return (
    <div className="cemOverlay" role="dialog" aria-label="Ajouter un employé" aria-modal="true">
      <button className="cemBackdrop" type="button" aria-label="Fermer" onClick={onClose} />

      <section className="cemPanel" aria-label="Formulaire d'ajout d'un employé">
        <header className="cemHead">
          <div className="cemTitleBlock">
            <div className="cemTitle">Ajouter un employé</div>
            <div className="cemSubtitle">Renseignez les informations du nouvel employé</div>
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
              Créer l’employé
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

