import { useEffect, useMemo, useState } from 'react'
import './createAssetModal.css'

const TYPE_ACTIF_OPTIONS = [
  { value: 'LAPTOP', label: 'Ordinateur Portable' },
  { value: 'DESKTOP', label: 'Ordinateur de Bureau' },
  { value: 'MONITOR', label: 'Écran' },
  { value: 'PHONE', label: 'Téléphone' },
  { value: 'TABLET', label: 'Tablette' },
  { value: 'ACCESSORY', label: 'Accessoire' },
  { value: 'OTHER', label: 'Autre' },
]

const STATUT_OPTIONS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'ASSIGNE', label: 'Assigné' },
  { value: 'EN_MAINTENANCE', label: 'En maintenance' },
  { value: 'HORS_SERVICE', label: 'Hors service' },
]

export function CreateAssetModal({ open, onClose, onCreate }) {
  const [nom, setNom] = useState('')
  const [typeActif, setTypeActif] = useState('LAPTOP')
  const [numeroSerie, setNumeroSerie] = useState('')
  const [description, setDescription] = useState('')
  const [dateAcquisition, setDateAcquisition] = useState('')
  const [statut, setStatut] = useState('DISPONIBLE')
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    if (!nom.trim()) return false
    if (!typeActif) return false
    if (!numeroSerie.trim()) return false
    if (!dateAcquisition) return false
    if (!statut) return false
    return true
  }, [nom, typeActif, numeroSerie, dateAcquisition, statut])

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

    const payload = {
      nom: nom.trim(),
      typeActif,
      numeroSerie: numeroSerie.trim(),
      description: description.trim(),
      dateAcquisition,
      statut,
    }

    onCreate({
      name: payload.nom,
      type: TYPE_ACTIF_OPTIONS.find(o => o.value === payload.typeActif)?.label || payload.typeActif,
      serial: payload.numeroSerie,
      assignedTo: payload.statut === 'ASSIGNE' ? 'À définir' : 'Non assigné',
      status: STATUT_OPTIONS.find(o => o.value === payload.statut)?.label || payload.statut,
      tone: payload.statut === 'DISPONIBLE' ? 'green' : payload.statut === 'ASSIGNE' ? 'blue' : payload.statut === 'EN_MAINTENANCE' ? 'orange' : 'red',
      _domain: payload,
    })

    onClose()
    setNom('')
    setTypeActif('LAPTOP')
    setNumeroSerie('')
    setDescription('')
    setDateAcquisition('')
    setStatut('DISPONIBLE')
  }

  return (
    <div className="camOverlay" role="dialog" aria-label="Ajouter un actif" aria-modal="true">
      <button className="camBackdrop" type="button" aria-label="Fermer" onClick={onClose} />

      <section className="camPanel" aria-label="Formulaire d'ajout d'un actif">
        <header className="camHead">
          <div className="camTitleBlock">
            <div className="camTitle">Ajouter un actif IT</div>
            <div className="camSubtitle">Renseignez les informations du nouvel équipement</div>
          </div>
          <button className="camClose" type="button" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        <form className="camBody" onSubmit={handleSubmit}>
          <div className="camGrid">
            <label className="camField">
              <span className="camLabel">Nom de l'actif</span>
              <input className="camInput" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: MacBook Pro 16&quot;" />
            </label>

            <label className="camField">
              <span className="camLabel">Type d'actif</span>
              <select className="camInput" value={typeActif} onChange={(e) => setTypeActif(e.target.value)}>
                {TYPE_ACTIF_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="camField">
              <span className="camLabel">Numéro de série</span>
              <input className="camInput" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} placeholder="Ex: C02GXC87MD6M" />
            </label>

            <label className="camField">
              <span className="camLabel">Date d'acquisition</span>
              <input className="camInput" type="date" value={dateAcquisition} onChange={(e) => setDateAcquisition(e.target.value)} />
            </label>

            <label className="camField" style={{ gridColumn: '1 / -1' }}>
              <span className="camLabel">Description</span>
              <input className="camInput" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails supplémentaires (couleur, état...)" />
            </label>

            <label className="camField" style={{ gridColumn: '1 / -1' }}>
              <span className="camLabel">Statut</span>
              <select className="camInput" value={statut} onChange={(e) => setStatut(e.target.value)}>
                {STATUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <div className="camError" role="alert">
              {error}
            </div>
          ) : null}

          <footer className="camFooter">
            <button className="camSecondary" type="button" onClick={onClose}>
              Annuler
            </button>
            <button className="camPrimary" type="submit" disabled={!canSubmit}>
              Créer l'actif
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
