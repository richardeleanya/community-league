import { createCommunityLeagueProductWalkthroughService } from '@/lib/product-walkthrough';

export const dynamic = 'force-dynamic';

export default function ProductWalkthroughPage() {
  const service = createCommunityLeagueProductWalkthroughService();
  const snapshot = service.getProductWalkthroughSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="product-walkthrough-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-031 Product Walkthrough</p>
          <h1 id="product-walkthrough-title">Release candidate review and product walkthrough.</h1>
          <p className="hero-copy">{snapshot.headline}</p>
        </header>

        <section className="validation-panel" aria-label="Product walkthrough review">
          <div>
            <p className="eyebrow">Walkthrough Position</p>
            <h2>
              {snapshot.reviewDecision.productReviewBlocked
                ? 'Product walkthrough is blocked.'
                : 'Product walkthrough is ready for review.'}
            </h2>
            <p>
              {snapshot.stages.length} walkthrough stages and {snapshot.personas.length} persona
              journeys are mapped against the accepted release candidate foundation.
            </p>
          </div>

          <ul className="validation-list">
            {snapshot.stages.map((stage) => (
              <li key={stage.step}>
                {stage.area} â€” {stage.actor}: {stage.walkthroughIntent}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}