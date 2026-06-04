import { createCommunityLeagueProductionSupabaseContractService } from '@/lib/production-supabase-contract';

export const dynamic = 'force-dynamic';

export default function ProductionSupabaseContractPage() {
  const service = createCommunityLeagueProductionSupabaseContractService();
  const snapshot = service.getProductionSupabaseContractSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="production-supabase-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-037 Production Supabase Contract</p>
          <h1 id="production-supabase-title">
            Production Supabase project preparation and migration execution contract.
          </h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Production Supabase contract position">
          <div>
            <p className="eyebrow">Database Launch Position</p>
            <h2>Production Supabase can be prepared without embedding production secrets.</h2>
            <p>
              {snapshot.preparationSteps.length} preparation steps, {snapshot.migrations.length}{' '}
              migrations and {snapshot.validationChecks.length} validation checks are recorded.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.preparationSteps.map((step) => (
              <li key={step.key}>
                {step.order}. {step.title}: {step.instruction}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}