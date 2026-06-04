export const dynamic = 'force-dynamic';

const profileChecks = [
  'Club identity and active status',
  'Club community points position',
  'Supporter count and approved actions',
  'Supporter identity and club link',
  'Supporter level and XP title',
  'Supporter season and all-time points',
  'Supporter ranking position',
  'Legacy proof and map output',
];

export default function ProfilesFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="profiles-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-014 Profiles</p>
          <h1 id="profiles-title">Club and supporter profile surface.</h1>
          <p className="hero-copy">
            This surface turns accepted leaderboard output into profile-ready data: club identity,
            supporter identity, community points, rank position, level title and legacy proof.
          </p>
        </header>

        <section className="validation-panel" aria-label="Club and supporter profile readiness">
          <div>
            <p className="eyebrow">Profile Surface Foundation</p>
            <h2>Profiles are connected to the accepted leaderboard and points outputs.</h2>
            <p>
              The live profile API is available at /api/profiles and returns club profile cards,
              supporter profile cards, profile counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {profileChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}