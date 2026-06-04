export const dynamic = 'force-dynamic';

const recognitionChecks = [
  'Award type enum catalogue',
  'Supporter ranking candidates',
  'Club table recognition candidates',
  'Approved action recognition candidates',
  'Points and rank proof references',
  'Award publication readiness',
  'Moderation foundation dependency',
  'Recognition API snapshot',
];

export default function AwardsRecognitionFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="awards-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-018 Recognition</p>
          <h1 id="awards-title">Awards and recognition surface.</h1>
          <p className="hero-copy">
            This surface turns rankings, league table position, approved actions and proof
            references into recognition-ready award candidates.
          </p>
        </header>

        <section className="validation-panel" aria-label="Awards and recognition readiness">
          <div>
            <p className="eyebrow">Recognition Foundation</p>
            <h2>Recognition is connected to rankings, clubs, approved actions and award enums.</h2>
            <p>
              The live awards API is available at /api/awards and returns award type options,
              recognition candidates, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {recognitionChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}