export const dynamic = 'force-dynamic';

const adminChecks = [
  'Platform setting catalogue',
  'Public settings whitelist',
  'Fraud control thresholds',
  'Verification control thresholds',
  'Action submission limits',
  'Authentication and lockout limits',
  'Admin and moderator role summary',
  'Audit log visibility',
];

export default function AdminControlFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="admin-control-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-021 Admin Control</p>
          <h1 id="admin-control-title">Platform settings and admin control surface.</h1>
          <p className="hero-copy">
            This surface turns platform settings, role controls, public whitelist state and audit
            logs into the first admin command foundation.
          </p>
        </header>

        <section className="validation-panel" aria-label="Platform settings and admin control readiness">
          <div>
            <p className="eyebrow">Admin Foundation</p>
            <h2>Admin control is connected to settings, roles and audit evidence.</h2>
            <p>
              The live admin control API is available at /api/admin-control and returns setting
              cards, role summary, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {adminChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}