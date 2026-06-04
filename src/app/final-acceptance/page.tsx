import { createCommunityLeagueFinalAcceptanceService } from '@/lib/final-acceptance';

export const dynamic = 'force-dynamic';

export default function FinalAcceptancePackPage() {
  const service = createCommunityLeagueFinalAcceptanceService();
  const snapshot = service.getFinalAcceptanceSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="final-acceptance-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-030 Final Acceptance</p>
          <h1 id="final-acceptance-title">Release candidate runtime proof and final acceptance pack.</h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Final acceptance position">
          <div>
            <p className="eyebrow">Final Position</p>
            <h2>
              {snapshot.readiness.finalAcceptanceBlocked
                ? 'Final acceptance is blocked.'
                : 'Final acceptance pack is ready for lock.'}
            </h2>
            <p>
              {snapshot.acceptedStepCount} prior accepted steps are represented with final runtime
              proof routes, release readiness proof and release candidate hardening proof.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.proofItems.map((item) => (
              <li key={item.key}>
                {item.area}: {item.proof}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}