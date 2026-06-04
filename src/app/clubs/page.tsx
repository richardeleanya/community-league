export const dynamic = 'force-dynamic';

const discoverySignals = [
  'Current season discovery',
  'Active league discovery',
  'Club selection cards',
  'Verified club identity markers',
  'Supporter onboarding handoff',
];

export default function ClubLeagueDiscoveryPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="clubs-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-008 Club / League Discovery</p>
          <h1 id="clubs-title">Find your club. Enter the league.</h1>
          <p className="hero-copy">
            This surface turns the accepted onboarding foundation into a controlled discovery path:
            current season, active league, club selection cards and readiness for supporter identity
            assignment.
          </p>
        </header>

        <section className="validation-panel" aria-label="Club and league discovery readiness">
          <div>
            <p className="eyebrow">Discovery Foundation</p>
            <h2>League and club discovery is now represented as a live foundation service.</h2>
            <p>
              The live discovery API is available at /api/discovery-foundation and returns the
              current season, active leagues, featured clubs, discovery counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {discoverySignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}