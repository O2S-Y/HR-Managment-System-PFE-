import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import './settingsPage.css'

export function SettingsPage() {
  return (
    <AppShell
      header={<TopBar title="Settings" showSearch={false} user={{ name: 'Atelier IT', role: 'Owner' }} />}
    >
      <section className="settingsCard">
        <h2 className="settingsTitle">Paramètres</h2>
        <p className="settingsSubtitle">Cette page est un placeholder à compléter.</p>
      </section>
    </AppShell>
  )
}

