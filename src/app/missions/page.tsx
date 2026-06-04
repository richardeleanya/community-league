const missions = [
  {
    title: 'Community clean-up',
    points: '50 pts',
    evidence: 'Before/after photo or organiser confirmation',
  },
  {
    title: 'Food bank support',
    points: '75 pts',
    evidence: 'Donation proof, volunteer record, or partner confirmation',
  },
  {
    title: 'Youth coaching support',
    points: '100 pts',
    evidence: 'Session photo, attendance note, or organiser confirmation',
  },
];

export default function MissionsPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="missions-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Missions</p>
          <h1 id="missions-title">Missions turn goodwill into verified league points.</h1>
          <p className="hero-copy">
            Choose a mission after you have chosen a club. Each mission explains what action is
            needed and what proof should be submitted.
          </p>
        </header>

        <section className="validation-panel" aria-label="Mission verification rule">
          <p className="eyebrow">Trust rule</p>
          <h2>Verification happens before points.</h2>
          <p>
            Proof protects the league table. Evidence is checked before points are awarded so every
            club can trust the competition.
          </p>
          <a className="primary-action" href="/submit-action">
            Submit evidence after completing a mission
          </a>
        </section>

        <section className="surface-grid" aria-label="Mission catalogue">
          {missions.map((mission) => (
            <article className="info-card" key={mission.title}>
              <p className="eyebrow">{mission.points}</p>
              <h2>{mission.title}</h2>
              <p>{mission.evidence}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}