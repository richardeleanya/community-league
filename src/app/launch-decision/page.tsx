import { createCommunityLeagueLaunchDecisionService } from '@/lib/launch-decision';

export const dynamic = 'force-dynamic';

export default function LaunchDecisionPage() {
  const service = createCommunityLeagueLaunchDecisionService();
  const snapshot = service.getLaunchDecisionSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="launch-decision-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-032 Launch Decision</p>
          <h1 id="launch-decision-title">Founder review notes and launch decision register.</h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Launch decision position">
          <div>
            <p className="eyebrow">Launch Position</p>
            <h2>
              {snapshot.decision.launchBlocked
                ? 'Launch decision is on hold.'
                : 'Launch decision is ready for founder review.'}
            </h2>
            <p>
              {snapshot.founderReviewNotes.length} founder review notes and{' '}
              {snapshot.launchCriteria.length} launch criteria are mapped against the accepted
              release candidate evidence.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.launchCriteria.map((criterion) => (
              <li key={criterion.key}>
                {criterion.area}: {criterion.criterion} Evidence: {criterion.evidence}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}