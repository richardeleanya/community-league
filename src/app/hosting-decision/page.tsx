import { createCommunityLeagueHostingDecisionService } from '@/lib/hosting-decision';

export const dynamic = 'force-dynamic';

export default function HostingDecisionPage() {
  const service = createCommunityLeagueHostingDecisionService();
  const snapshot = service.getHostingDecisionSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="hosting-decision-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-035 Hosting Connector Decision</p>
          <h1 id="hosting-decision-title">Deployment target selection and hosting connector decision.</h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Hosting decision position">
          <div>
            <p className="eyebrow">Selected Target</p>
            <h2>{snapshot.decision.selectedTarget}</h2>
            <p>{snapshot.decision.reason}</p>
          </div>

          <ul className="validation-list">
            {snapshot.candidates.map((candidate) => (
              <li key={candidate.key}>
                {candidate.name}: {candidate.decisionStatus}. {candidate.nextAction}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}