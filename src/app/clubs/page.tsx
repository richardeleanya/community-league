const clubJourney = [
  'Choose the club you want to support.',
  'Open the supporter dashboard to see the competition position.',
  'Follow active missions and submit verified community action.',
  'Watch approved actions move the club table.',
];

export default function ClubsPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="clubs-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Club Discovery</p>
          <h1 id="clubs-title">Find your club, then enter the action journey.</h1>
          <p className="hero-copy">
            Clubs are the public competition anchor. Supporters do not just browse clubs; they
            choose who they are backing, then move into missions, action submission, and the live
            league table.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            <a className="primary-action" href="/dashboard">
              Open supporter dashboard
            </a>
            <a className="secondary-action" href="/missions">
              See active missions
            </a>
          </div>
        </header>

        <section className="validation-panel" aria-label="Club journey">
          <div>
            <p className="eyebrow">What happens after club selection</p>
            <h2>The club page is the start of supporter participation.</h2>
            <p>
              The next step is clear: understand the club context, then move into dashboard and
              missions so community activity can become verified points.
            </p>
          </div>

          <ul className="validation-list">
            {clubJourney.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}