const journeySteps = [
  {
    label: 'Start here',
    title: 'Choose your club',
    text: 'This is the first click. Pick the club you want to support before choosing missions.',
    href: '/clubs',
  },
  {
    label: 'Next',
    title: 'Pick a mission',
    text: 'Missions explain the community action, proof needed, and points available.',
    href: '/missions',
  },
  {
    label: 'Then',
    title: 'Submit evidence',
    text: 'Send the completed action for review so points can be released fairly.',
    href: '/submit-action',
  },
  {
    label: 'Result',
    title: 'Move the table',
    text: 'Verified action updates the club competition and shows community impact.',
    href: '/leaderboard',
  },
];

const supportLinks = [
  {
    title: 'I am new here',
    text: 'Start with club selection. That tells the platform who your action supports.',
    href: '/clubs',
  },
  {
    title: 'I already know my club',
    text: 'Open missions and choose the community action you want to complete.',
    href: '/missions',
  },
  {
    title: 'I have finished an action',
    text: 'Submit your proof so it can be checked before points are awarded.',
    href: '/submit-action',
  },
];

export default function HomePage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="home-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Community Premier League</p>
          <h1 id="home-title">Start here: choose your club, then complete a mission.</h1>
          <p className="hero-copy">
            Community Premier League turns local good work into a live club competition.
            Supporters choose a club, complete verified community missions, submit evidence,
            and help their club move up the league table.
          </p>

          <div
            aria-label="Start here action"
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              border: '1px solid rgba(34, 197, 94, 0.45)',
              borderRadius: '1.25rem',
              background: 'rgba(34, 197, 94, 0.08)',
            }}
          >
            <p className="eyebrow">Start here</p>
            <h2 style={{ margin: 0 }}>First click: find your club.</h2>
            <p>
              If you are unsure what to do, click the main button below. Club selection is the
              starting point for supporters.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
              <a className="primary-action" href="/clubs">
                Start here: choose your club
              </a>
              <a className="secondary-action" href="/missions">
                Already chose a club? View missions
              </a>
            </div>
          </div>
        </header>

        <section className="validation-panel" aria-label="What should I click first">
          <div>
            <p className="eyebrow">What should I click first?</p>
            <h2>Follow the route: club, mission, evidence, points.</h2>
            <p>
              The product works like a simple competition journey. You back a club first, then
              complete actions that can become verified league points.
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
                <p className="eyebrow">{step.label}</p>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="validation-panel" aria-label="Choose the route that fits you">
          <div>
            <p className="eyebrow">Choose your route</p>
            <h2>Three common starting points.</h2>
            <p>
              New supporters should start with clubs. Returning supporters can go straight to
              missions or evidence submission.
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
            {supportLinks.map((item) => (
              <a
                key={item.title}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: '1rem',
                  textDecoration: 'none',
                }}
              >
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}