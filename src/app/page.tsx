const journeySteps = [
  {
    title: '1. Find a club',
    text: 'Supporters start by choosing the club they want to back in the Community Premier League.',
    href: '/clubs',
  },
  {
    title: '2. Pick a mission',
    text: 'Every mission explains the community action, proof needed, and how points can be earned.',
    href: '/missions',
  },
  {
    title: '3. Submit evidence',
    text: 'Actions are submitted with a description, location context, and evidence for review.',
    href: '/submit-action',
  },
  {
    title: '4. Move the table',
    text: 'Approved actions release points and update the club position on the live leaderboard.',
    href: '/leaderboard',
  },
];

const proofPoints = [
  'Live Supabase-backed production foundation',
  'Verified routes, APIs, and deployment evidence',
  'Community actions connected to missions, points, XP, and league tables',
];

export default function HomePage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="home-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Community Premier League</p>
          <h1 id="home-title">Community action becomes club competition.</h1>
          <p className="hero-copy">
            Community Premier League turns local good work into a live football-style table.
            Supporters complete verified community missions, clubs earn points, and the league
            table shows which communities are moving first.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            <a className="primary-action" href="/clubs">
              Find your club
            </a>
            <a className="secondary-action" href="/missions">
              View missions
            </a>
          </div>
        </header>

        <section className="validation-panel" aria-label="How the platform works">
          <div>
            <p className="eyebrow">First user journey</p>
            <h2>Four simple steps: club, mission, evidence, points.</h2>
            <p>
              The platform is designed so a first-time visitor can understand what to do next
              without needing training or an explanation from the founder.
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
            {journeySteps.map((step) => (
              <a
                key={step.title}
                href={step.href}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: '1rem',
                  textDecoration: 'none',
                }}
              >
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="validation-panel" aria-label="Launch proof">
          <div>
            <p className="eyebrow">Why it is credible</p>
            <h2>Built as a live, evidence-backed competition platform.</h2>
            <p>
              This is not a static campaign page. It is a deployed product foundation with
              production routes, APIs, evidence packs, and operational launch checks.
            </p>
          </div>

          <ul className="validation-list">
            {proofPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}