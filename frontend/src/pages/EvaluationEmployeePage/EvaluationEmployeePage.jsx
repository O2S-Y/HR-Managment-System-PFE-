import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import './evaluationEmployeePage.css'

function DotRating({ value = 4 }) {
  return (
    <div className="eeDots" aria-label={`Note ${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'eeDot eeDotOn' : 'eeDot eeDotOff'} />
      ))}
    </div>
  )
}

export function EvaluationEmployeePage() {
  const objectives = [
    {
      title: 'Deliver Q1 Architectural Refactoring for Core API Services',
      rating: 5,
      comment:
        'Mohamed absolutely crushed this objective. Not only was the refactoring delivered two weeks ahead of schedule, but the resulting latency improvements (down 40%) exceeded our target KPIs. His technical leadership during the code reviews was exemplary.',
    },
    {
      title: 'Mentor Junior Developers & Lead Bi-weekly Tech Talks',
      rating: 3,
      comment:
        "Solid effort here. The tech talks were well-received when they happened, though a few were postponed due to project pressures. Mentorship of the new grads has been effective, but there's room to create a more structured onboarding doc for them next quarter.",
    },
    {
      title: 'Improve Test Coverage on Legacy Modules by 25%',
      rating: 4,
      comment:
        'Coverage increased by 22%, which is very close to the aggressive target we set. The quality of the tests written is high, focusing on critical paths rather than just chasing percentages. Great diligence demonstrated here.',
    },
  ]

  return (
    <AppShell
      header={
        <TopBar
          title="Évaluations"
          subtitle="EVALUATIONS"
          showSearch
          searchPlaceholder="Rechercher..."
          user={{ name: 'Mohamed Alami', role: 'Employé' }}
        />
      }
    >
      <div className="eePage">
        <section className="eeHeader">
          <div className="eeNameRow">
            <h1 className="eeName">Mohamed Alami</h1>
            <span className="eePeriodPill">T1 2025</span>
          </div>
          <div className="eeSub">Software Engineering • Level 4</div>
        </section>

        <section className="eeOverall">
          <div className="eeOverallTitle">OVERALL PERFORMANCE</div>
          <div className="eeOverallScore">4 / 5</div>
          <DotRating value={4} />
          <div className="eeOverallText">Exceeds Expectations</div>
        </section>

        <section className="eeObjectives">
          <div className="eeSectionTitle">CORE OBJECTIVES REVIEW</div>

          {objectives.map((o) => (
            <div key={o.title} className="eeObj">
              <div className="eeObjHead">
                <div className="eeObjTitle">{o.title}</div>
                <DotRating value={o.rating} />
              </div>

              <div className="eeCommentBox">
                <div className="eeCommentLabel">MANAGER COMMENT</div>
                <div className="eeCommentText">{o.comment}</div>
              </div>

              <div className="eeSideBar" aria-hidden="true" />
            </div>
          ))}
        </section>

        <footer className="eeFooter">
          <div className="eeFooterItem">EVALUATED BY: SARAH MANSOUR (RH)</div>
          <div className="eeFooterItem">15 MARS 2025</div>
        </footer>
      </div>
    </AppShell>
  )
}

