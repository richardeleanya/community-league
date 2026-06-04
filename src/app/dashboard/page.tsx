export const dynamic = 'force-dynamic';

const dashboardPanels = [
  'My community points',
  'Club league position',
  'Available missions',
  'Action approval status',
  'XP level progress',
  'Legacy contribution trail',
];

export default function SupporterDashboardPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="dashboard-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-009 Supporter Dashboard</p>
          <h1 id="dashboard-title">Your supporter command centre.</h1>
          <p className="hero-copy">
            This surface turns club and league discovery into the first supporter dashboard
            foundation: points, progress, missions, approvals, club standing and legacy signals.
          </p>
        </header>

        <section className="validation-panel" aria-label="Supporter dashboard foundation readiness">
          <div>
            <p className="eyebrow">Dashboard Foundation</p>
            <h2>Supporter progress is now represented as a live dashboard service.</h2>
            <p>
              The live dashboard API is available at /api/supporter-dashboard and returns dashboard
              counts, proof metrics, featured clubs, XP progress bands and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {dashboardPanels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}