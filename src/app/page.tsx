const processSteps = [
  {
    title: '1. Choose your club',
    text: 'This tells the platform which club your community action will support.',
    href: '/clubs',
  },
  {
    title: '2. Complete a mission',
    text: 'Pick a real community action with clear proof requirements.',
    href: '/missions',
  },
  {
    title: '3. Submit evidence',
    text: 'Evidence is checked before points so every club is treated fairly.',
    href: '/submit-action',
  },
  {
    title: '4. Verified points move the table',
    text: 'Verification happens before points. Proof protects the league table.',
    href: '/leaderboard',
  },
];

const laterRoutes = [
  {
    title: 'Already chose a club?',
    text: 'Go to missions after your first club choice is clear.',
    href: '/missions',
  },
  {
    title: 'Already completed a mission?',
    text: 'Submit evidence when your action is ready for review.',
    href: '/submit-action',
  },
  {
    title: 'Want to see the competition?',
    text: 'Open the leaderboard after you understand how verified points are earned.',
    href: '/leaderboard',
  },
];

export default function HomePage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="home-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Community Premier League</p>
          <h1 id="home-title">Do this first: choose your club.</h1>
          <p className="hero-copy">
            Community Premier League turns local good work into a club competition.
            To begin, choose the club you want your community action to support.
          </p>

          <section
            aria-label="Single first action"
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              border: '2px solid rgba(34, 197, 94, 0.72)',
              borderRadius: '1.5rem',
              background: 'rgba(34, 197, 94, 0.1)',
            }}
          >
            <p className="eyebrow">Only one first click</p>
            <h2 style={{ margin: 0 }}>Start here: choose your club.</h2>
            <p style={{ fontSize: '1.05rem' }}>
              Do this first. After you choose a club, the next step is to pick a mission.
            </p>
            <a
              className="primary-action"
              href="/clubs"
              aria-label="Do this first: choose your club"
              style={{
                display: 'inline-flex',
                marginTop: '1rem',
                fontSize: '1.05rem',
                padding: '0.95rem 1.35rem',
              }}
            >
              Do this first: choose your club
            </a>
          </section>
        </header>

        <section className="validation-panel" aria-label="Why evidence is required">
          <div>
            <p className="eyebrow">Fair points need proof</p>
            <h2>Proof protects the league table.</h2>
            <p>
              Verification happens before points so every club is treated fairly.
              A mission becomes league points only after evidence is checked.
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
            <div
              style={{
                padding: '1rem',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: '1rem',
              }}
            >
              <strong>Mission</strong>
              <p>Choose a real community action with a clear outcome.</p>
            </div>
            <div
              style={{
                padding: '1rem',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: '1rem',
              }}
            >
              <strong>Evidence</strong>
              <p>Submit proof so the action can be checked fairly.</p>
            </div>
            <div
              style={{
                padding: '1rem',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: '1rem',
              }}
            >
              <strong>Verification</strong>
              <p>Verification happens before points to keep the competition trusted.</p>
            </div>
          </div>
        </section>

        <section className="validation-panel" aria-label="What happens after the first click">
          <div>
            <p className="eyebrow">After the first click</p>
            <h2>Then follow the route: mission, evidence, verification, points.</h2>
            <p>
              The first decision is deliberately simple. Choose a club first, then move through the
              community action journey.
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
            {processSteps.map((step) => (
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

        <section className="validation-panel" aria-label="Alternative routes after club choice">
          <div>
            <p className="eyebrow">Not your first visit?</p>
            <h2>Use these only after the first action is clear.</h2>
            <p>
              These routes are useful later, but they are not the first click for a new supporter.
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
            {laterRoutes.map((route) => (
              <a
                key={route.title}
                href={route.href}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: '1rem',
                  textDecoration: 'none',
                }}
              >
                <strong>{route.title}</strong>
                <p>{route.text}</p>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}