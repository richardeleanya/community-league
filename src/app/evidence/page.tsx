export const dynamic = 'force-dynamic';

const evidenceChecks = [
  'Submission description proof',
  'Photo evidence count',
  'GPS coordinates and accuracy',
  'Mission and fixture context',
  'Verification status and tier',
  'Points, XP and legacy award output',
  'Fraud flag and score visibility',
  'Audit and notification proof trail',
];

export default function EvidenceDetailFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="evidence-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-016 Evidence</p>
          <h1 id="evidence-title">Community action evidence detail surface.</h1>
          <p className="hero-copy">
            This surface turns submitted community actions into evidence-ready detail cards with
            supporter, club, mission, photo, GPS, verification and award proof.
          </p>
        </header>

        <section className="validation-panel" aria-label="Community action evidence detail readiness">
          <div>
            <p className="eyebrow">Evidence Detail Foundation</p>
            <h2>Action evidence is connected to mission, verification and points award outputs.</h2>
            <p>
              The live evidence detail API is available at /api/evidence and returns action
              evidence cards, proof trails, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {evidenceChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}