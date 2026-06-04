import { createCommunityLeagueDeploymentOperatorGateService } from '@/lib/deployment-operator-gate';

export const dynamic = 'force-dynamic';

export default function DeploymentOperatorGatePage() {
  const service = createCommunityLeagueDeploymentOperatorGateService();
  const snapshot = service.getDeploymentOperatorGateSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="deployment-operator-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-038 Deployment Operator Gate</p>
          <h1 id="deployment-operator-title">
            Production deployment operator checklist and external action gate.
          </h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Deployment operator gate position">
          <div>
            <p className="eyebrow">External Action Required</p>
            <h2>Local release-candidate work is complete; external deployment actions are now separated.</h2>
            <p>
              {snapshot.checklist.length} checklist items and {snapshot.manualActions.length} manual
              actions are recorded before public launch.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.checklist.map((item) => (
              <li key={item.key}>
                {item.order}. {item.area}: {item.action}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}