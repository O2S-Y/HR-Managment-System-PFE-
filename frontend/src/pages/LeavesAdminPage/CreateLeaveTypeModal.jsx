import { useEffect, useState } from 'react'
import './leaveAdminModals.css'

export function CreateLeaveTypeModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [quota, setQuota] = useState('')
  const [status, setStatus] = useState('Actif')
  const [error, setError] = useState('')

  const canSubmit = name.trim() && quota.trim() && status

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

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) {
      setError('Veuillez remplir tous les champs requis.')
      return
    }

    onCreate({
      name: name.trim(),
      quota: quota.trim(),
      status
    })

    onClose()
    setName('')
    setQuota('')
    setStatus('Actif')
  }

  return (
    <div className="lamOverlay" role="dialog" aria-modal="true">
      <button className="lamBackdrop" type="button" aria-label="Fermer" onClick={onClose} />
      <section className="lamPanel">
        <header className="lamHead">
          <div className="lamTitleBlock">
            <div className="lamTitle">Ajouter un type de congé</div>
            <div className="lamSubtitle">Définissez un nouveau type et son quota par défaut</div>
          </div>
          <button className="lamClose" type="button" onClick={onClose}>✕</button>
        </header>

        <form className="lamBody" onSubmit={handleSubmit}>
          <div className="lamGrid">
            <label className="lamField">
              <span className="lamLabel">Nom du type</span>
              <input className="lamInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Congé Exceptionnel" />
            </label>

            <label className="lamField">
              <span className="lamLabel">Quota (ex: 5 jours, Illimité...)</span>
              <input className="lamInput" value={quota} onChange={(e) => setQuota(e.target.value)} placeholder="Ex: 5 jours" />
            </label>

            <label className="lamField">
              <span className="lamLabel">Statut</span>
              <select className="lamInput" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
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
