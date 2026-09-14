import './payrollPage.css'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { payrollApi, employeeApi } from '../../services/authApi'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

/* Available tax types that RH can select */
const AVAILABLE_TAXES = [
  { key: 'ir', label: 'IR (Impôt sur le Revenu)', description: 'Retenue à la source sur le revenu salarial' },
  { key: 'cnss', label: 'CNSS', description: 'Caisse Nationale de Sécurité Sociale' },
  { key: 'amo', label: 'AMO', description: 'Assurance Maladie Obligatoire' },
  { key: 'other', label: 'Autre déduction', description: 'Prêt, avance, sanction, etc.' },
]

function IconWallet(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M21 7H3V5h18v2Zm0 2H3v10h18V9Zm-4 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  )
}

function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 5v6H5v2h6v6h2v-6h6v-2h-6V5h-2Z" />
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

function formatMAD(value) {
  return new Intl.NumberFormat('fr-MA', { style: 'decimal', minimumFractionDigits: 2 }).format(value) + ' MAD'
}

export function PayrollPage() {
  const { user } = useAuth()
  const isRH = user?.role === 'RH'
  const navigate = useNavigate()

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

  const [tab, setTab] = useState('payslips')
  const [showForm, setShowForm] = useState(false)
  const [payslips, setPayslips] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [filterMonth, setFilterMonth] = useState(0) // 0 = all

  // Form state
  const [formEmployee, setFormEmployee] = useState('')
  const [formMonth, setFormMonth] = useState(new Date().getMonth() + 1)
  const [formYear, setFormYear] = useState(new Date().getFullYear())
  const [formSalaire, setFormSalaire] = useState('')
  const [formPrimes, setFormPrimes] = useState('')
  const [selectedTaxes, setSelectedTaxes] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1)
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear())
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([])
  const [bulkError, setBulkError] = useState('')

  useEffect(() => {
    const mois = filterMonth === 0 ? null : filterMonth
    Promise.all([
      mois
        ? payrollApi.getByPeriod(mois, filterYear).catch(() => [])
        : payrollApi.getByPeriod(new Date().getMonth() + 1, filterYear).catch(() => []),
      employeeApi.getAll().catch(() => []),
    ])
      .then(([payData, empData]) => {
        setPayslips(payData ?? [])
        setEmployees(empData ?? [])
      })
      .finally(() => setLoading(false))
  }, [filterYear, filterMonth])

  useEffect(() => {
    if (!formEmployee) {
      setFormSalaire('')
      setFormPrimes('')
      setSelectedTaxes([])
      return
    }

    payrollApi.calculate(Number(formEmployee), Number(formMonth), Number(formYear))
      .then((data) => {
        setFormSalaire(data.salaireBase || '')
        setFormPrimes(data.primes !== undefined ? data.primes : '')
        
        const taxes = []
        if (data.cnss > 0) {
          taxes.push({ key: 'cnss', label: 'CNSS', amount: data.cnss.toFixed(2) })
        }
        if (data.amo > 0) {
          taxes.push({ key: 'amo', label: 'AMO', amount: data.amo.toFixed(2) })
        }
        if (data.ir > 0) {
          taxes.push({ key: 'ir', label: 'IR (Impôt sur le Revenu)', amount: data.ir.toFixed(2) })
        }
        if (data.autresDeductions > 0) {
          taxes.push({ key: 'other', label: 'Autre déduction (Absences/Congés)', amount: data.autresDeductions.toFixed(2) })
        }
        setSelectedTaxes(taxes)
      })
      .catch((err) => {
        console.error('Failed to calculate payroll', err)
      })
  }, [formEmployee, formMonth, formYear])

  const handleToggleTax = (tax) => {
    const exists = selectedTaxes.find((t) => t.key === tax.key)
    if (exists) {
      setSelectedTaxes(selectedTaxes.filter((t) => t.key !== tax.key))
    } else {
      setSelectedTaxes([...selectedTaxes, { key: tax.key, label: tax.label, amount: '' }])
    }
  }

  const handleTaxAmountChange = (key, amount) => {
    setSelectedTaxes(selectedTaxes.map((t) => t.key === key ? { ...t, amount } : t))
  }

  const totalDeductionsForm = selectedTaxes.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  const netForm = (Number(formSalaire) || 0) + (Number(formPrimes) || 0) - totalDeductionsForm

  const filteredPayslips = payslips.filter(
    (p) => {
      const pYear = p.annee || p.year || 0
      const pMonth = p.mois || p.month || 0
      return pYear === filterYear && (filterMonth === 0 || pMonth === filterMonth)
    }
  )

  const totalMasse = filteredPayslips.reduce((acc, p) => acc + (p.salaireBase || 0), 0)
  const totalNet = filteredPayslips.reduce((acc, p) => acc + (p.salaireNet || p.net || 0), 0)
  const totalDeductions = totalMasse - totalNet

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emp = employees.find((emp) => emp.id === Number(formEmployee))
    if (!emp) return

    try {
      const payload = {
        idEmploye: emp.id,
        mois: Number(formMonth),
        annee: Number(formYear),
        salaireBase: Number(formSalaire),
        primes: Number(formPrimes) || 0,
        deductions: totalDeductionsForm,
        cnss: selectedTaxes.filter(t => t.key === 'cnss').reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
        amo: selectedTaxes.filter(t => t.key === 'amo').reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
        ir: selectedTaxes.filter(t => t.key === 'ir').reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
        cimr: 0,
        autresDeductions: selectedTaxes.filter(t => t.key === 'other').reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
      }
      const created = await payrollApi.create(payload)
      setPayslips(prev => [created, ...prev])
      setShowForm(false)
      setFormEmployee('')
      setFormSalaire('')
      setFormPrimes('')
      setSelectedTaxes([])
    } catch (err) {
      console.error('Failed to create payslip', err)
      alert('Erreur lors de la création du bulletin')
    }
  }

  const bulkEmployees = employees.filter(emp => emp.statut === 'ACTIF' && emp.userRole !== 'OWNER')

  const handleSelectAllBulk = (e) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(bulkEmployees.map(emp => emp.id))
    } else {
      setSelectedEmployeeIds([])
    }
  }

  const handleToggleBulkEmployee = (id) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter(x => x !== id))
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, id])
    }
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()
    setBulkError('')
    if (selectedEmployeeIds.length === 0) {
      setBulkError("Veuillez sélectionner au moins un employé.")
      return
    }

    try {
      setLoading(true)
      const payload = {
        employeeIds: selectedEmployeeIds,
        mois: Number(bulkMonth),
        annee: Number(bulkYear),
      }
      const results = await payrollApi.createBulk(payload)
      
      const payData = await payrollApi.getByPeriod(Number(bulkMonth), Number(bulkYear))
      setPayslips(payData ?? [])
      
      setShowBulkModal(false)
      alert(`✅ ${results.length} bulletin(s) de paie ont été généré(s) en brouillon avec succès !`)
    } catch (err) {
      console.error("Failed to generate bulk payrolls", err)
      setBulkError(err?.response?.data?.message || "Erreur lors de la génération en masse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell
      header={
        <TopBar
          title="Gestion de la Paie"
          right={
            isRH && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="payAddBtn"
                  type="button"
                  onClick={() => navigate('/payroll/me')}
                  style={{ background: 'var(--brand-cyan, #5B96AE)', color: '#fff' }}
                >
                  Mes Bulletins
                </button>
                <button
                  className="payAddBtn"
                  type="button"
                  onClick={() => setShowBulkModal(true)}
                  style={{ background: '#27ae60', borderColor: '#27ae60', color: '#fff' }}
                >
                  <IconPlus />
                  Générer en masse
                </button>
                <button className="payAddBtn" type="button" onClick={() => setShowForm(!showForm)}>
                  <IconPlus />
                  Nouveau bulletin
                </button>
              </div>
            )
          }
        />
      }
    >
      <div className="payMain">
        {/* KPI row */}
        <section className="payKpiRow" aria-label="Résumé">
          <div className="payKpiCard">
            <div className="payKpiDot payKpiDotGreen" />
            <div className="payKpiValue">{formatMAD(totalMasse)}</div>
            <div className="payKpiLabel">Masse salariale brute</div>
          </div>
          <div className="payKpiCard">
            <div className="payKpiDot payKpiDotRed" />
            <div className="payKpiValue">{formatMAD(totalDeductions)}</div>
            <div className="payKpiLabel">Total déductions</div>
          </div>
          <div className="payKpiCard">
            <div className="payKpiDot payKpiDotBlue" />
            <div className="payKpiValue">{formatMAD(totalNet)}</div>
            <div className="payKpiLabel">Total net à payer</div>
          </div>
          <div className="payKpiCard">
            <div className="payKpiDot payKpiDotPurple" />
            <div className="payKpiValue">{filteredPayslips.length}</div>
            <div className="payKpiLabel">Bulletins générés</div>
          </div>
        </section>

        {/* Tabs */}
        <div className="payTabs">
          <button className={`payTab ${tab === 'payslips' ? 'payTabActive' : ''}`} onClick={() => setTab('payslips')}>
            Bulletins de paie
          </button>
        </div>

        {/* Bulletin Form with Tax Selection */}
        {showForm && tab === 'payslips' && (
          <section className="payFormCard" aria-label="Nouveau bulletin">
            <div className="payFormTitle">
              <IconWallet />
              Nouveau bulletin de paie
            </div>
            <form className="payForm" onSubmit={handleSubmit}>
              <div className="payFormRow payFormRowTriple">
                <label className="payLabel">
                  Employé
                  <select className="paySelect" value={formEmployee} onChange={(e) => setFormEmployee(e.target.value)} required>
                    <option value="">Sélectionner</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.nomComplet || emp.name}</option>
                    ))}
                  </select>
                </label>
                <label className="payLabel">
                  Mois
                  <select className="paySelect" value={formMonth} onChange={(e) => setFormMonth(e.target.value)}>
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="payLabel">
                  Année
                  <input type="number" className="payInput" value={formYear} onChange={(e) => setFormYear(e.target.value)} min="2020" max="2030" />
                </label>
              </div>

              <div className="payFormRow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label className="payLabel">
                  Salaire de base (MAD)
                  <input type="number" className="payInput" value={formSalaire} onChange={(e) => setFormSalaire(e.target.value)} step="0.01" required />
                </label>
                <label className="payLabel">
                  Primes (MAD)
                  <input type="number" className="payInput" value={formPrimes} onChange={(e) => setFormPrimes(e.target.value)} step="0.01" />
                </label>
              </div>

              <div className="payTaxSection">
                <div className="payTaxSectionTitle">Sélectionner les déductions à appliquer</div>
                <div className="payTaxGrid">
                  {AVAILABLE_TAXES.map((tax) => {
                    const isSelected = selectedTaxes.some((t) => t.key === tax.key)
                    return (
                      <div key={tax.key} className={`payTaxItem ${isSelected ? 'payTaxItemActive' : ''}`}>
                        <label className="payTaxCheckRow">
                          <input type="checkbox" className="payTaxCheckbox" checked={isSelected} onChange={() => handleToggleTax(tax)} />
                          <div className="payTaxInfo">
                            <span className="payTaxName">{tax.label}</span>
                            <span className="payTaxDesc">{tax.description}</span>
                          </div>
                        </label>
                        {isSelected && (
                          <div className="payTaxAmountRow">
                            <label className="payTaxAmountLabel">
                              Montant (MAD)
                              <input type="number" className="payInput payTaxAmountInput" value={selectedTaxes.find(t => t.key === tax.key)?.amount || ''} onChange={(e) => handleTaxAmountChange(tax.key, e.target.value)} step="0.01" placeholder="0.00" min="0" />
                            </label>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="payFormSummary">
                <div className="payFormSummaryRow">
                  <span>Salaire de base</span>
                  <strong>{formatMAD(Number(formSalaire) || 0)}</strong>
                </div>
                {Number(formPrimes) > 0 && (
                  <div className="payFormSummaryRow">
                    <span>Primes / Prime d'ancienneté</span>
                    <strong>{formatMAD(Number(formPrimes) || 0)}</strong>
                  </div>
                )}
                {selectedTaxes.filter(t => Number(t.amount) > 0).map(t => (
                  <div key={t.key} className="payFormSummaryRow payFormSummaryRowDed">
                    <span>– {t.label}</span>
                    <span className="payFormSummaryRed">- {formatMAD(Number(t.amount))}</span>
                  </div>
                ))}
                <div className="payFormSummaryRow payFormSummaryRowTotal">
                  <span>Net à payer</span>
                  <strong className="payFormSummaryGreen">{formatMAD(netForm)}</strong>
                </div>
              </div>

              <div className="payFormActions">
                <button type="button" className="payCancelBtn" onClick={() => { setShowForm(false); setSelectedTaxes([]) }}>Annuler</button>
                <button type="submit" className="paySubmitBtn"><IconCheck /> Générer le bulletin</button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="payFilters">
          <select className="paySelect payFilterSelect" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
            {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="paySelect payFilterSelect" value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
            <option value={0}>Tous les mois</option>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </section>

        {/* Payslips Table */}
        {tab === 'payslips' && (
          <section className="payTableWrap" aria-label="Bulletins de paie">
            <table className="payTable">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Période</th>
                  <th className="payThRight">Salaire brut</th>
                  <th className="payThRight">Total déductions</th>
                  <th className="payThRight">Net à payer</th>
                  <th className="payThRight">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="payEmpty">Chargement…</td></tr>
                ) : filteredPayslips.length === 0 ? (
                  <tr><td colSpan="6" className="payEmpty">Aucun bulletin pour cette période.</td></tr>
                ) : filteredPayslips.map((p) => {
                  const name = p.employee?.nomComplet || p.name || '—'
                  const mois = p.mois || p.month || 1
                  const annee = p.annee || p.year || ''
                  const base = p.salaireBase || 0
                  const net = p.salaireNet || p.net || 0
                  const totalDed = base - net

                  return (
                    <tr key={p.id}>
                      <td className="payTdStrong">{name}</td>
                      <td className="payTdMono">{MONTHS[mois - 1]} {annee}</td>
                      <td className="payThRight">{formatMAD(base)}</td>
                      <td className="payThRight payTdRed">{formatMAD(totalDed)}</td>
                      <td className="payThRight payTdNet">{formatMAD(net)}</td>
                      <td className="payThRight">
                        <button
                          onClick={() => handleDownloadPDF(p)}
                          className="payAddBtn"
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            borderRadius: '6px',
                            background: 'var(--brand-cyan, #5B96AE)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Télécharger
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        )}

        {showBulkModal && (
          <div className="payOverlay" onClick={() => setShowBulkModal(false)}>
            <div className="payModal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <div className="payModalHeader">
                <h3 className="payModalTitle">Générer les bulletins en masse</h3>
                <button className="payModalClose" onClick={() => setShowBulkModal(false)}>✕</button>
              </div>
              <form onSubmit={handleBulkSubmit}>
                <div className="payModalBody" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <label className="payLabel">
                      Mois
                      <select className="paySelect" value={bulkMonth} onChange={(e) => setBulkMonth(Number(e.target.value))}>
                        {MONTHS.map((m, i) => (
                          <option key={i} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </label>
                    <label className="payLabel">
                      Année
                      <input type="number" className="payInput" value={bulkYear} onChange={(e) => setBulkYear(Number(e.target.value))} min="2020" max="2030" />
                    </label>
                  </div>

                  <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '13px', color: 'var(--brand-navy)' }}>
                    Sélectionner les employés ({selectedEmployeeIds.length}/{bulkEmployees.length})
                  </div>

                  <div style={{ background: 'var(--surface-2, #fafafa)', border: '1px solid var(--border-soft)', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', cursor: 'pointer', borderBottom: '1px solid var(--border-soft)', paddingBottom: '6px' }}>
                      <input type="checkbox" checked={selectedEmployeeIds.length === bulkEmployees.length && bulkEmployees.length > 0} onChange={handleSelectAllBulk} />
                      Tout sélectionner
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {bulkEmployees.map(emp => (
                        <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedEmployeeIds.includes(emp.id)} onChange={() => handleToggleBulkEmployee(emp.id)} />
                          {emp.nomComplet || emp.name} <span style={{ color: '#8a9bb0', fontSize: '11px' }}>({emp.poste})</span>
                        </label>
                      ))}
                      {bulkEmployees.length === 0 && (
                        <div style={{ color: '#8a9bb0', fontStyle: 'italic', fontSize: '12px', textAlign: 'center' }}>Aucun employé actif trouvé</div>
                      )}
                    </div>
                  </div>

                  {bulkError && (
                    <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                      ⚠️ {bulkError}
                    </div>
                  )}
                </div>
                <div className="payModalFooter">
                  <button className="payModalSecondary" type="button" onClick={() => setShowBulkModal(false)}>Annuler</button>
                  <button className="payModalPrimary" type="submit" disabled={selectedEmployeeIds.length === 0}>
                    Générer les brouillons
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
