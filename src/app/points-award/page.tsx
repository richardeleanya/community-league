export const dynamic = 'force-dynamic';

const awardChecks = [
  'Approved-action trigger',
  'Points and XP award calculation',
  'Supporter totals update',
  'Club totals update',
  'League table recalculation',
  'Individual ranking update',
  'Points notification',
  'Audit log entry',
];

export default function PointsAwardFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="points-award-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-012 Points Award</p>
          <h1 id="points-award-title">Award points and refresh the league table.</h1>
          <p className="hero-copy">
            This surface validates the approved-action path from verification into the points
            engine, supporter totals, club totals, rankings, notifications, audit logs and league
            table recalculation.
          </p>
        </header>

        <section className="validation-panel" aria-label="Points award foundation readiness">
          <div>
            <p className="eyebrow">Award Foundation</p>
            <h2>Approved community actions now have a live award-readiness service.</h2>
            <p>
              The live points award API is available at /api/points-award and returns awarded
              actions, engine counts, league table rows and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {awardChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}