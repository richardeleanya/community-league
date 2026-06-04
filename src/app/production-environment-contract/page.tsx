import { createCommunityLeagueProductionEnvironmentContractService } from '@/lib/production-environment-contract';

export const dynamic = 'force-dynamic';

export default function ProductionEnvironmentContractPage() {
  const service = createCommunityLeagueProductionEnvironmentContractService();
  const snapshot = service.getProductionEnvironmentContractSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="production-environment-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-034 Production Environment Contract</p>
          <h1 id="production-environment-title">
            Deployment target preparation and production environment contract.
          </h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Production environment contract position">
          <div>
            <p className="eyebrow">Contract Position</p>
            <h2>
              {snapshot.contractDecision.contractBlocked
                ? 'Production environment contract is blocked.'
                : 'Production environment contract is ready for target selection.'}
            </h2>
            <p>
              {snapshot.requirements.length} production requirements,{' '}
              {snapshot.targetOptions.length} deployment target options and {snapshot.secrets.length}{' '}
              secret requirements are recorded.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.requirements.map((item) => (
              <li key={item.key}>
                {item.area}: {item.requirement} Required input: {item.productionInputRequired}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}