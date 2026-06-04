export const dynamic = 'force-dynamic';

const operationsChecks = [
  'Competition operating state',
  'Mission operating window',
  'Action submission pipeline',
  'Verification and points pipeline',
  'Moderation attention queue',
  'Activity and notification stream',
  'Evidence-ready action state',
  'Platform control readiness',
];

export default function OperationsOverviewFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="operations-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-022 Operations</p>
          <h1 id="operations-title">Admin dashboard and operations overview surface.</h1>
          <p className="hero-copy">
            This surface connects the accepted Community League foundations into one operations
            overview for admin command, readiness, attention and proof.
          </p>
        </header>

        <section className="validation-panel" aria-label="Admin dashboard and operations overview readiness">
          <div>
            <p className="eyebrow">Operations Foundation</p>
            <h2>Operations is connected across competition, mission, action, verification and admin control.</h2>
            <p>
              The live operations API is available at /api/operations-overview and returns metrics,
              workstreams, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {operationsChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}