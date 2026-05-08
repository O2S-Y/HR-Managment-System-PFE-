import { useEffect, useState } from 'react'
import './leaveAdminModals.css'

export function CreateLeaveAdjustmentModal({ open, onClose, onCreate }) {
  const [employee, setEmployee] = useState('')
  const [type, setType] = useState('Congé Annuel')
  const [adjustment, setAdjustment] = useState('')
  const [reason, setReason] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')

  const canSubmit = employee.trim() && type && adjustment.trim() && reason.trim() && date

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

    // Format date nicely if possible, or just use raw
    const d = new Date(date)
    const formattedDate = !isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : date

    onCreate({
      employee: employee.trim(),
      type,
      adjustment: adjustment.trim(),
      reason: reason.trim(),
      date: formattedDate
    })

    onClose()
    setEmployee('')
    setType('Congé Annuel')
    setAdjustment('')
    setReason('')
    setDate('')
  }

  return (
    <div className="lamOverlay" role="dialog" aria-modal="true">
      <button className="lamBackdrop" type="button" aria-label="Fermer" onClick={onClose} />
      <section className="lamPanel">
        <header className="lamHead">
          <div className="lamTitleBlock">
            <div className="lamTitle">Nouvel ajustement</div>
            <div className="lamSubtitle">Ajustez manuellement le solde d'un collaborateur</div>
          </div>
          <button className="lamClose" type="button" onClick={onClose}>✕</button>
        </header>

        <form className="lamBody" onSubmit={handleSubmit}>
          <div className="lamGrid">
            <label className="lamField">
              <span className="lamLabel">Employé</span>
              <input className="lamInput" value={employee} onChange={(e) => setEmployee(e.target.value)} placeholder="Ex: Sophie Martin" />
            </label>

            <label className="lamField">
              <span className="lamLabel">Type de congé</span>
              <select className="lamInput" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Congé Annuel">Congé Annuel</option>
                <option value="RTT">RTT</option>
                <option value="Maladie">Maladie</option>
                <option value="Congé sans solde">Congé sans solde</option>
              </select>
            </label>

            <label className="lamField">
              <span className="lamLabel">Ajustement (jours)</span>
              <input className="lamInput" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} placeholder="Ex: +2 jours ou -1 jour" />
            </label>

            <label className="lamField">
              <span className="lamLabel">Motif de l'ajustement</span>
              <input className="lamInput" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: Régularisation" />
            </label>

            <label className="lamField">
              <span className="lamLabel">Date d'effet</span>
              <input className="lamInput" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>

          {error ? <div className="lamError">{error}</div> : null}

          <footer className="lamFooter">
            <button className="lamSecondary" type="button" onClick={onClose}>Annuler</button>
            <button className="lamPrimary" type="submit" disabled={!canSubmit}>Enregistrer</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
