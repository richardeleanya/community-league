import { createCommunityLeagueReleaseCandidateHardeningService } from '@/lib/release-hardening';

export const dynamic = 'force-dynamic';

export default function ReleaseCandidateHardeningPage() {
  const service = createCommunityLeagueReleaseCandidateHardeningService();
  const snapshot = service.getReleaseCandidateHardeningSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="release-candidate-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-029 Release Candidate</p>
          <h1 id="release-candidate-title">Release candidate hardening and defect closure pass.</h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Release candidate hardening position">
          <div>
            <p className="eyebrow">Candidate Position</p>
            <h2>
              {snapshot.readiness.releaseCandidateBlocked
                ? 'Release candidate is blocked.'
                : 'Release candidate hardening is closed for review.'}
            </h2>
            <p>
              {snapshot.hardeningChecks.length} hardening checks and {snapshot.defectClosures.length}{' '}
              defect closures are registered against the accepted release readiness evidence.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.defectClosures.map((defect) => (
              <li key={defect.key}>
                {defect.severity.toUpperCase()} / {defect.area}: {defect.closureDecision}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}