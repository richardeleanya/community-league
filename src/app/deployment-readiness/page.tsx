import { createCommunityLeagueDeploymentReadinessService } from '@/lib/deployment-readiness';

export const dynamic = 'force-dynamic';

export default function DeploymentReadinessPage() {
  const service = createCommunityLeagueDeploymentReadinessService();
  const snapshot = service.getDeploymentReadinessSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="deployment-readiness-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-033 Deployment Readiness</p>
          <h1 id="deployment-readiness-title">Launch checklist and deployment readiness register.</h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Deployment readiness position">
          <div>
            <p className="eyebrow">Deployment Position</p>
            <h2>
              {snapshot.handoff.deploymentBlocked
                ? 'Deployment readiness is blocked.'
                : 'Local release candidate is ready for deployment target preparation.'}
            </h2>
            <p>
              {snapshot.launchChecklist.length} launch checklist items and{' '}
              {snapshot.deploymentReadiness.length} deployment readiness items are recorded.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.launchChecklist.map((item) => (
              <li key={item.key}>
                {item.area}: {item.item} Evidence: {item.evidence}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}