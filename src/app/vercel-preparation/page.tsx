import { createCommunityLeagueVercelPreparationService } from '@/lib/vercel-preparation';

export const dynamic = 'force-dynamic';

export default function VercelPreparationPage() {
  const service = createCommunityLeagueVercelPreparationService();
  const snapshot = service.getVercelPreparationSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="vercel-preparation-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-036 Vercel Preparation</p>
          <h1 id="vercel-preparation-title">
            Vercel project import preparation and production variable template.
          </h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Vercel preparation position">
          <div>
            <p className="eyebrow">Selected Hosting Target</p>
            <h2>Vercel project import is prepared without embedding production secrets.</h2>
            <p>
              {snapshot.importSteps.length} import steps and {snapshot.productionVariables.length}{' '}
              production variable requirements are recorded.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.importSteps.map((step) => (
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