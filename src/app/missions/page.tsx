export const dynamic = 'force-dynamic';

const missionChecks = [
  'Active fixture mission window',
  'Home and away club context',
  'Mission title and description',
  'Action category and action type',
  'Base points and XP',
  'Fixture multiplier context',
  'Verification tier requirement',
  'Submission and points-award linkage',
];

export default function MissionsFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="missions-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-015 Missions</p>
          <h1 id="missions-title">Mission catalogue and fixture surface.</h1>
          <p className="hero-copy">
            This surface turns active fixtures into supporter-ready mission cards with club context,
            action type, points, XP, verification tier and active mission window readiness.
          </p>
        </header>

        <section className="validation-panel" aria-label="Mission catalogue readiness">
          <div>
            <p className="eyebrow">Mission Catalogue Foundation</p>
            <h2>Missions are connected to active fixtures and accepted points output.</h2>
            <p>
              The live mission catalogue API is available at /api/missions and returns fixture
              mission cards, mission catalogue cards, readiness counts and validation output.
            </p>
          </div>

          <ul className="validation-list">
            {missionChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}