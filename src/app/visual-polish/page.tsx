import { createCommunityLeagueVisualPolishService } from '@/lib/visual-polish';

export const dynamic = 'force-dynamic';

export default function VisualPolishMaturityPassPage() {
  const service = createCommunityLeagueVisualPolishService();
  const snapshot = service.getVisualPolishSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="visual-polish-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-026 Visual Polish</p>
          <h1 id="visual-polish-title">Responsive visual polish and public shell maturity pass.</h1>
          <p className="hero-copy">
            This page confirms the public shell now has a unified responsive visual system,
            accessible focus states, mobile breakpoints, reduced-motion handling and print proof
            styling.
          </p>
        </header>

        <section className="validation-panel" aria-label="Visual polish maturity checks">
          <div>
            <p className="eyebrow">Maturity Checks</p>
            <h2>{snapshot.headline}</h2>
          </div>

          <div className="card-grid">
            {snapshot.scales.map((scale) => (
              <article className="metric-card" key={scale.key}>
                <p className="eyebrow">{scale.label}</p>
                <h3>{scale.value}</h3>
                <p>{scale.proofReference}</p>
              </article>
            ))}
          </div>

          <ul className="validation-list">
            {snapshot.checks.map((check) => (
              <li key={check.key}>
                {check.label}: {check.status.toUpperCase()}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}