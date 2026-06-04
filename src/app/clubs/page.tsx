const clubNextSteps = [
  {
    title: 'New supporter',
    text: 'Open the supporter dashboard after choosing your club so the journey feels anchored.',
    href: '/dashboard',
  },
  {
    title: 'Ready to act',
    text: 'Go to missions when you know which club your community action should support.',
    href: '/missions',
  },
  {
    title: 'Proof ready',
    text: 'Submit evidence when the action is already complete and ready for review.',
    href: '/submit-action',
  },
];

export default function ClubsPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="clubs-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Club Discovery</p>
          <h1 id="clubs-title">Choose your club first. Missions come next.</h1>
          <p className="hero-copy">
            Club selection gives every action a team to support. Once a supporter knows their club,
            the next step is simple: open missions, complete a community action, and submit proof.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            <a className="primary-action" href="/missions">
              Next step: view missions
            </a>
            <a className="secondary-action" href="/dashboard">
              Open supporter dashboard
            </a>
          </div>
        </header>

        <section className="validation-panel" aria-label="After choosing a club">
          <div>
            <p className="eyebrow">After choosing a club</p>
            <h2>The next action should be obvious.</h2>
            <p>
              If the supporter has selected or recognised their club, they should move into the
              mission catalogue or dashboard without needing to search.
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
            {clubNextSteps.map((step) => (
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
      </section>
    </main>
  );
}