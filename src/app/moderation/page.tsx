export const dynamic = 'force-dynamic';

const moderationChecks = [
  'Submitted action queue',
  'Verification status visibility',
  'Fraud score risk band',
  'Photo and GPS evidence presence',
  'Duplicate hash signal',
  'Device fingerprint signal',
  'Fraud report enum readiness',
  'Penalty table readiness',
];

export default function ModerationReviewFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="moderation-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-017 Moderation</p>
          <h1 id="moderation-title">Fraud and moderation review surface.</h1>
          <p className="hero-copy">
            This surface turns action evidence into review-ready moderation signals with fraud
            score, verification status, photo proof, GPS proof, duplicate signal and device signal.
          </p>
        </header>

        <section className="validation-panel" aria-label="Fraud and moderation review readiness">
          <div>
            <p className="eyebrow">Moderation Review Foundation</p>
            <h2>Moderation is connected to action evidence and fraud signal data.</h2>
            <p>
              The live moderation API is available at /api/moderation and returns review items,
              risk signals, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {moderationChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}