export const dynamic = 'force-dynamic';

const leaderboardChecks = [
  'Current season league table',
  'Club positions and community points',
  'Supporter overall ranking',
  'Supporter in-club ranking',
  'Approved action linkage',
  'Points notification proof',
  'Points audit proof',
  'Live leaderboard API',
];

export default function LeaderboardFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="leaderboard-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-013 Leaderboard</p>
          <h1 id="leaderboard-title">League table and leaderboard surface.</h1>
          <p className="hero-copy">
            This surface exposes the public competitive output of the Community League: club
            position, supporter ranking, awarded points, audit-backed score movement and live
            leaderboard readiness.
          </p>
        </header>

        <section className="validation-panel" aria-label="League table and leaderboard readiness">
          <div>
            <p className="eyebrow">Leaderboard Foundation</p>
            <h2>Accepted points awards now feed the league table and supporter leaderboard.</h2>
            <p>
              The live leaderboard API is available at /api/leaderboard and returns league table
              rows, individual leaderboard rows, score counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {leaderboardChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}