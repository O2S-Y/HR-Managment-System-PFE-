import './payslipsMyPage.css'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useState, useEffect } from 'react'
import { payrollApi } from '../../services/authApi'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function formatMAD(value) {
  return new Intl.NumberFormat('fr-MA', { style: 'decimal', minimumFractionDigits: 2 }).format(value) + ' MAD'
}

export function PayslipsMyPage() {
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const handleDownloadPDF = (p) => {
    if (!window.html2pdf) {
      alert("Le module d'export PDF n'est pas encore chargé. Veuillez patienter ou recharger la page.");
      return;
    }

    const employeeName = p.employee?.nomComplet || p.name || '—';
    const cin = p.employee?.cin || '—';
    const poste = p.employee?.poste || '—';
    const departement = p.employee?.departement || '—';
    const dateEmbauche = p.employee?.dateEmbauche || '—';
    const typeContrat = p.employee?.typeContrat || '—';
    const immatriculationCnss = p.employee?.immatriculationCnss || p.immatriculationCnss || '—';

    const base = p.salaireBase || 0;
    const primes = p.primes || 0;
    const deductions = p.deductions || 0;
    const cnss = p.cnss || 0;
    const amo = p.amo || 0;
    const ir = p.ir || 0;
    const autresDeductions = p.autresDeductions || p.autres || 0;
    const net = p.salaireNet || p.net || 0;

    const mois = p.mois || p.month || 1;
    const annee = p.annee || p.year || '';

    const formatMois = mois < 10 ? `0${mois}` : mois;
    const lastDay = new Date(annee, mois, 0).getDate();
    const periodStr = `Du 01/${formatMois}/${annee} au ${lastDay}/${formatMois}/${annee}`;

    const formatNumber = (value) => {
      return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    };

    let seniorityRateStr = "—";
    const hireDateStr = p.employee?.dateEmbauche || dateEmbauche;
    if (hireDateStr && hireDateStr !== '—') {
      try {
        const hireDate = new Date(hireDateStr);
        const periodEnd = new Date(annee, mois - 1, 28);
        const diffTime = Math.abs(periodEnd - hireDate);
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        if (diffYears >= 25) seniorityRateStr = "25,00%";
        else if (diffYears >= 20) seniorityRateStr = "20,00%";
        else if (diffYears >= 12) seniorityRateStr = "15,00%";
        else if (diffYears >= 5) seniorityRateStr = "10,00%";
        else if (diffYears >= 2) seniorityRateStr = "5,00%";
        else seniorityRateStr = "0,00%";
      } catch (e) {
        console.error(e);
      }
    }

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; text-transform: uppercase;">NEWDEV MAROC S.A.</h2>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px; line-height: 1.4;">
              123 Boulevard d'Anfa, 5ème Étage, Casablanca, Maroc<br/>
              ICE: 003214567890123 &nbsp;|&nbsp; N° Affiliation CNSS: 7654321
            </div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
              Reçu de Paie
            </span>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 6px;">
              Période: ${MONTHS[mois - 1]} ${annee}
            </div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
              ${periodStr}
            </div>
          </div>
        </div>

        <!-- Info Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 25px; padding: 14px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 11px; line-height: 1.5; color: #334155;">
          <div>
            <span style="color: #64748b;">Collaborateur:</span> <strong style="color: #0f172a;">${employeeName}</strong><br/>
            <span style="color: #64748b;">CIN:</span> <strong>${cin}</strong><br/>
            <span style="color: #64748b;">N° CNSS:</span> <strong>${immatriculationCnss}</strong>
          </div>
          <div>
            <span style="color: #64748b;">Poste:</span> <strong>${poste} (${departement})</strong><br/>
            <span style="color: #64748b;">Date d'embauche:</span> <strong>${dateEmbauche}</strong><br/>
            <span style="color: #64748b;">Base de travail:</span> <strong>26 Jours (Standard)</strong>
          </div>
        </div>

        <!-- Rubriques Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 10px; text-transform: uppercase; color: #475569; font-weight: 700;">
              <th style="padding: 8px 4px;">Désignation Rubrique</th>
              <th style="padding: 8px 4px; text-align: right; width: 15%;">Base</th>
              <th style="padding: 8px 4px; text-align: right; width: 12%;">Taux</th>
              <th style="padding: 8px 4px; text-align: right; width: 18%;">Gains (MAD)</th>
              <th style="padding: 8px 4px; text-align: right; width: 18%;">Retenues (MAD)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 4px; font-weight: 600; color: #0f172a;">Salaire de base</td>
              <td style="padding: 8px 4px; text-align: right; color: #475569;">26,00</td>
              <td style="padding: 8px 4px; text-align: right; color: #64748b;">—</td>
              <td style="padding: 8px 4px; text-align: right; font-weight: 600; color: #0f172a;">${formatNumber(base)}</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
            </tr>
            ${primes > 0 ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 4px; color: #0f172a;">Prime d'ancienneté</td>
              <td style="padding: 8px 4px; text-align: right; color: #475569;">${formatNumber(base)}</td>
              <td style="padding: 8px 4px; text-align: right; color: #475569;">${seniorityRateStr}</td>
              <td style="padding: 8px 4px; text-align: right; color: #0f172a;">${formatNumber(primes)}</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
            </tr>
            ` : ''}
            ${cnss > 0 ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 4px; color: #475569;">Cotisation CNSS</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #475569;">4,48%</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #0f172a;">${formatNumber(cnss)}</td>
            </tr>
            ` : ''}
            ${amo > 0 ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 4px; color: #475569;">Cotisation AMO</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #475569;">2,26%</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #0f172a;">${formatNumber(amo)}</td>
            </tr>
            ` : ''}
            ${ir > 0 ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 4px; color: #475569;">Impôt sur le Revenu (IR)</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #475569;">Barème</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #0f172a;">${formatNumber(ir)}</td>
            </tr>
            ` : ''}
            ${autresDeductions > 0 ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 4px; color: #475569;">Autres déductions (Congés/Absences)</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #cbd5e1;">—</td>
              <td style="padding: 8px 4px; text-align: right; color: #0f172a;">${formatNumber(autresDeductions)}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>

        <!-- Totals Summary Card -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 35px;">
          <div style="width: 320px; border-top: 2px solid #0f172a; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; color: #475569;">
              <span>Total Brut :</span>
              <span>${formatNumber(base + primes)} MAD</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; color: #b91c1c;">
              <span>Total Retenues :</span>
              <span>-${formatNumber(deductions)} MAD</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #0f172a; background: #f8fafc; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span>Net à Payer :</span>
              <span>${formatNumber(net)} MAD</span>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #475569; margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
          <div>
            <p style="margin: 0 0 4px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">L'Employé</p>
            <p style="margin: 0; font-style: italic; font-size: 9px; color: #94a3b8;">Signature précédée de la mention "Lu et approuvé"</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0 0 4px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Pour l'Employeur</p>
            <p style="margin: 0; font-family: monospace; font-size: 9px; color: #0f172a; font-weight: bold; border: 1px solid #0f172a; padding: 2px 6px; display: inline-block; border-radius: 2px;">
              NEWDEV MAROC S.A.
            </p>
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin:       15,
      filename:     `bulletin_paie_${employeeName.replace(/\s+/g, '_')}_${mois}_${annee}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save();
  }

  useEffect(() => {
    payrollApi.getMyPayrolls()
      .then((data) => setPayslips(data ?? []))
      .catch((err) => console.error('Failed to load payslips', err))
      .finally(() => setLoading(false))
  }, [])

  const latest = payslips[0]
  const latestDeductions = latest
    ? (latest.ir || 0) + (latest.cnss || 0) + (latest.amo || 0) + (latest.autresDeductions || 0)
    : 0

  return (
    <AppShell
      header={<TopBar title="Mes Bulletins de Paie" />}
    >
      <div className="myPayMain">
        {/* Summary card */}
        <section className="myPaySummary">
          <div className="myPaySummaryCard">
            <div className="myPaySummaryLabel">Dernier salaire net</div>
            <div className="myPaySummaryValue">{formatMAD(latest?.salaireNet || latest?.net || 0)}</div>
            <div className="myPaySummaryPeriod">{latest ? `${MONTHS[(latest.mois || latest.month || 1) - 1]} ${latest.annee || latest.year || ''}` : '—'}</div>
          </div>
          <div className="myPaySummaryCard">
            <div className="myPaySummaryLabel">Salaire de base</div>
            <div className="myPaySummaryValue">{formatMAD(latest?.salaireBase || 0)}</div>
            <div className="myPaySummaryPeriod">Brut mensuel</div>
          </div>
          <div className="myPaySummaryCard">
            <div className="myPaySummaryLabel">Total déductions</div>
            <div className="myPaySummaryValue myPaySummaryValueRed">{formatMAD(latestDeductions)}</div>
            <div className="myPaySummaryPeriod">IR + CNSS + AMO</div>
          </div>
        </section>

        {/* Payslips list */}
        <section className="myPayList" aria-label="Historique des bulletins">
          <div className="myPayListTitle">Historique des bulletins</div>
          {loading ? (
            <div className="myPayCard" style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Chargement…</div>
          ) : payslips.length === 0 ? (
            <div className="myPayCard" style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Aucun bulletin disponible</div>
          ) : payslips.map((p) => {
            const month = p.mois || p.month || 1
            const year = p.annee || p.year || ''
            const net = p.salaireNet || p.net || 0
            const base = p.salaireBase || 0
            const ir = p.ir || 0
            const cnss = p.cnss || 0
            const amo = p.amo || 0
            const autres = p.autresDeductions || p.autres || 0

            return (
              <div key={p.id} className="myPayCard">
                <button
                  className="myPayCardHeader"
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  aria-expanded={expandedId === p.id}
                >
                  <div className="myPayCardLeft">
                    <div className="myPayCardPeriod">{MONTHS[month - 1]} {year}</div>
                    <div className="myPayCardNet">Net : {formatMAD(net)}</div>
                  </div>
                  <div className="myPayCardRight" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(p);
                      }}
                      className="payAddBtn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        background: 'var(--brand-cyan, #5B96AE)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Télécharger PDF
                    </button>
                    <span className="myPayCardArrow">{expandedId === p.id ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expandedId === p.id && (
                  <div className="myPayCardBody">
                    <div className="myPayDetailGrid">
                      <div className="myPayDetailItem">
                        <span className="myPayDetailLabel">Salaire brut</span>
                        <span className="myPayDetailValue">{formatMAD(base)}</span>
                      </div>
                      <div className="myPayDetailItem">
                        <span className="myPayDetailLabel">IR</span>
                        <span className="myPayDetailValue myPayDetailRed">- {formatMAD(ir)}</span>
                      </div>
                      <div className="myPayDetailItem">
                        <span className="myPayDetailLabel">CNSS</span>
                        <span className="myPayDetailValue myPayDetailRed">- {formatMAD(cnss)}</span>
                      </div>
                      <div className="myPayDetailItem">
                        <span className="myPayDetailLabel">AMO</span>
                        <span className="myPayDetailValue myPayDetailRed">- {formatMAD(amo)}</span>
                      </div>
                      {autres > 0 && (
                        <div className="myPayDetailItem">
                          <span className="myPayDetailLabel">Autres déductions</span>
                          <span className="myPayDetailValue myPayDetailRed">- {formatMAD(autres)}</span>
                        </div>
                      )}
                      <div className="myPayDetailItem myPayDetailTotal">
                        <span className="myPayDetailLabel">Net à payer</span>
                        <span className="myPayDetailValue myPayDetailGreen">{formatMAD(net)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </div>
    </AppShell>
  )
}
