const dashboardActions = [
  {
    title: 'Check the position',
    text: 'Use the dashboard to understand the current club and supporter state.',
    href: '/leaderboard',
  },
  {
    title: 'Choose the next mission',
    text: 'Move from status into action by opening the active mission catalogue.',
    href: '/missions',
  },
  {
    title: 'Submit proof',
    text: 'Complete the journey by submitting evidence for verification and points.',
    href: '/submit-action',
  },
];

export default function DashboardPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="dashboard-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Supporter Command Centre</p>
          <h1 id="dashboard-title">Your next action should always be obvious.</h1>
          <p className="hero-copy">
            The supporter dashboard is the bridge between competition status and community action.
            It should help a supporter understand where their club stands, what matters now, and
            which mission to complete next.
          </p>
        </header>

        <section className="validation-panel" aria-label="Dashboard action path">
          <div>
            <p className="eyebrow">Decision path</p>
            <h2>Status is useful only when it leads to action.</h2>
            <p>
              Community Premier League keeps the dashboard focused on the simplest loop: position,
              mission, proof, points.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1.25rem',
            }}
          >
            {dashboardActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: '1rem',
                  textDecoration: 'none',
                }}
              >
                <strong>{action.title}</strong>
                <p>{action.text}</p>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}