import { createCommunityLeagueReleaseReadinessService } from '@/lib/release-readiness';

export const dynamic = 'force-dynamic';

export default function ReleaseReadinessEvidencePackPage() {
  const service = createCommunityLeagueReleaseReadinessService();
  const evidencePack = service.getReleaseReadinessEvidencePack();
  const blocked = evidencePack.readiness.releaseBlocked;

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="release-readiness-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-028 Release Readiness</p>
          <h1 id="release-readiness-title">Product QA register and release readiness evidence pack.</h1>
          <p className="hero-copy">{evidencePack.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Release readiness evidence">
          <div>
            <p className="eyebrow">Release Position</p>
            <h2>{blocked ? 'Release blocked for review.' : 'Release evidence pack is ready for review.'}</h2>
            <p>
              {evidencePack.acceptedStepCount} of {evidencePack.requiredStepCount} required accepted
              phase locks are represented, with QA controls, route surfaces and runtime proof linked
              into one release readiness position.
            </p>
          </div>

          <ul className="validation-list">
            {evidencePack.qaRegister.map((item) => (
              <li key={item.key}>
                {item.area}: {item.controlQuestion}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}