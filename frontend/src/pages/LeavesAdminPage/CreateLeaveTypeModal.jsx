import { useEffect, useState } from 'react'
import './leaveAdminModals.css'

const CATEGORIES = [
  { value: 'ANNUEL', label: 'Congé annuel' },
  { value: 'MALADIE', label: 'Maladie' },
  { value: 'MATERNITE', label: 'Maternité' },
  { value: 'PATERNITE', label: 'Paternité' },
  { value: 'SANS_SOLDE', label: 'Sans solde' },
  { value: 'AUTRE', label: 'Autre' },
]

export function CreateLeaveTypeModal({ open, onClose, onCreate }) {
  const [nom, setNom] = useState('')
  const [categorie, setCategorie] = useState('AUTRE')
  const [quota, setQuota] = useState('')
  const [justificationRequise, setJustificationRequise] = useState(false)
  const [actif, setActif] = useState(true)
  const [error, setError] = useState('')

  const canSubmit = nom.trim() && categorie && quota !== '' && Number(quota) >= 0

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) {
      setError('Veuillez remplir tous les champs requis.')
      return
    }

    onCreate({
      nom: nom.trim(),
      categorie,
      quotaAnnuelJours: Number(quota),
      justificationRequise,
      actif,
    })

    onClose()
    setNom('')
    setCategorie('AUTRE')
    setQuota('')
    setJustificationRequise(false)
    setActif(true)
  }

  return (
    <div className="lamOverlay" role="dialog" aria-modal="true">
      <button className="lamBackdrop" type="button" aria-label="Fermer" onClick={onClose} />
      <section className="lamPanel">
        <header className="lamHead">
          <div className="lamTitleBlock">
            <div className="lamTitle">Ajouter un type de congé</div>
            <div className="lamSubtitle">Définissez un nouveau type et son quota annuel</div>
          </div>
          <button className="lamClose" type="button" onClick={onClose}>✕</button>
        </header>

        <form className="lamBody" onSubmit={handleSubmit}>
          <div className="lamGrid">
            <label className="lamField">
              <span className="lamLabel">Nom du type</span>
              <input className="lamInput" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Congé Exceptionnel" />
            </label>

            <label className="lamField">
              <span className="lamLabel">Catégorie</span>
              <select className="lamInput" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="lamField">
              <span className="lamLabel">Quota annuel (jours)</span>
              <input className="lamInput" type="number" min="0" value={quota} onChange={(e) => setQuota(e.target.value)} placeholder="Ex: 18" />
            </label>

            <label className="lamField">
              <span className="lamLabel">Justification requise</span>
              <select className="lamInput" value={justificationRequise ? 'true' : 'false'} onChange={(e) => setJustificationRequise(e.target.value === 'true')}>
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </label>

            <label className="lamField">
              <span className="lamLabel">Statut</span>
              <select className="lamInput" value={actif ? 'true' : 'false'} onChange={(e) => setActif(e.target.value === 'true')}>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </label>
          </div>

          {error ? <div className="lamError">{error}</div> : null}

          <footer className="lamFooter">
            <button className="lamSecondary" type="button" onClick={onClose}>Annuler</button>
            <button className="lamPrimary" type="submit" disabled={!canSubmit}>Créer le type</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
