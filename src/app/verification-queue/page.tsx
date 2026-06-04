export const dynamic = 'force-dynamic';

const queuePanels = [
  'Pending action queue',
  'Fraud score attention',
  'Peer validation status',
  'Moderator decision validation',
  'Rejection reason control',
  'Audit trail target',
];

export default function VerificationQueueFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="verification-queue-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-011 Verification Queue</p>
          <h1 id="verification-queue-title">Review community actions before points are released.</h1>
          <p className="hero-copy">
            This surface turns action submission into a controlled verification queue: pending
            actions, fraud attention, peer validation context, moderator decisions and audit-trail
            readiness.
          </p>
        </header>

        <section className="validation-panel" aria-label="Verification queue foundation readiness">
          <div>
            <p className="eyebrow">Verification Foundation</p>
            <h2>Action review is now represented as a live verification queue service.</h2>
            <p>
              The live verification API is available at /api/verification-queue and returns queue
              counts, pending action rows, readiness checks and decision draft validation.
            </p>
          </div>

          <ul className="validation-list">
            {queuePanels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}