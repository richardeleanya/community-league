const leaderboardRows = [
  {
    position: '1',
    club: 'Community Club A',
    verifiedPoints: '1,240',
    trustPosition: 'Verified actions only',
  },
  {
    position: '2',
    club: 'Community Club B',
    verifiedPoints: '1,060',
    trustPosition: 'Evidence checked before points',
  },
  {
    position: '3',
    club: 'Community Club C',
    verifiedPoints: '920',
    trustPosition: 'Proof protects the table',
  },
];

const scoringSteps = [
  'Supporter chooses a club.',
  'Supporter completes a mission.',
  'Supporter submits evidence.',
  'Evidence is verified before points are awarded.',
  'Only verified points move the leaderboard.',
];

export default function LeaderboardPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="leaderboard-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Leaderboard</p>
          <h1 id="leaderboard-title">Verified points only.</h1>
          <p className="hero-copy">
            Proof is checked before scores change. The leaderboard only moves after evidence has
            been reviewed, so every club can trust the result.
          </p>
        </header>

        <section className="validation-panel" aria-label="Leaderboard trust rule">
          <p className="eyebrow">Trust rule</p>
          <h2>Proof is checked before scores change.</h2>
          <p>
            The table is not moved by claims alone. A community action becomes points only after
            evidence is verified. This keeps the competition fair, visible, and trusted.
          </p>
        </section>

        <section className="surface-grid" aria-label="Current leaderboard">
          {leaderboardRows.map((row) => (
            <article className="info-card" key={row.club}>
              <p className="eyebrow">Position {row.position}</p>
              <h2>{row.club}</h2>
              <p>{row.verifiedPoints} verified points</p>
              <p>{row.trustPosition}</p>
            </article>
          ))}
        </section>

        <section className="validation-panel" aria-label="How points reach the leaderboard">
          <p className="eyebrow">How points reach the table</p>
          <h2>Club, mission, evidence, verification, points.</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1.25rem',
            }}
          >
            {scoringSteps.map((step, index) => (
              <div
                key={step}
                style={{
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: '1rem',
                  padding: '1rem',
                }}
              >
                <p className="eyebrow">Step {index + 1}</p>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="validation-panel" aria-label="Next supporter action">
          <p className="eyebrow">Want to help a club move up?</p>
          <h2>Start with a club, then complete a mission.</h2>
          <p>
            Choose your club first. Then complete a mission and submit evidence for verification.
          </p>
          <a className="primary-action" href="/clubs">
            Choose your club
          </a>
        </section>
      </section>
    </main>
  );
}