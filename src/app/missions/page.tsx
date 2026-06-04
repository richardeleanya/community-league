const missionRules = [
  'Pick a mission that matches a real community action.',
  'Read what proof is needed before starting.',
  'Submit clear evidence once the action is complete.',
  'Wait for verification before points are released.',
];

export default function MissionsPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="missions-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Mission Catalogue</p>
          <h1 id="missions-title">Missions turn goodwill into verified league points.</h1>
          <p className="hero-copy">
            A mission is the bridge between community intent and competition movement. It explains
            what action to complete, what evidence to submit, and how the result can help a club
            climb the league table.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            <a className="primary-action" href="/submit-action">
              Submit completed action
            </a>
            <a className="secondary-action" href="/leaderboard">
              View league table
            </a>
          </div>
        </header>

        <section className="validation-panel" aria-label="Mission rules">
          <div>
            <p className="eyebrow">How to use missions</p>
            <h2>Complete the action, prove it clearly, then let verification release points.</h2>
            <p>
              The mission catalogue should make participation simple for supporters and reviewable
              for operators.
            </p>
          </div>

          <ul className="validation-list">
            {missionRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}