import Link from 'next/link';

import { createCommunityLeagueHomepageCompositionService } from '@/lib/homepage';

export const dynamic = 'force-dynamic';

export default function CommunityLeagueHomepage() {
  const service = createCommunityLeagueHomepageCompositionService();
  const snapshot = service.getHomepageCompositionSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="homepage-title">
        <header className="hero-panel__header">
          <p className="eyebrow">{snapshot.hero.eyebrow}</p>
          <h1 id="homepage-title">{snapshot.hero.title}</h1>
          <p className="hero-copy">{snapshot.hero.summary}</p>

          <div className="button-row" aria-label="Homepage primary actions">
            <Link className="button-primary" href={snapshot.hero.primaryAction.href}>
              {snapshot.hero.primaryAction.label}
            </Link>
            <Link className="button-secondary" href={snapshot.hero.secondaryAction.href}>
              {snapshot.hero.secondaryAction.label}
            </Link>
          </div>
        </header>

        <section className="validation-panel" aria-label="Public landing metrics">
          <div>
            <p className="eyebrow">Public Landing Foundation</p>
            <h2>Community action, league competition and proof are joined in one entry point.</h2>
            <p>{snapshot.headline}</p>
          </div>

          <div className="card-grid">
            {snapshot.metrics.map((metric) => (
              <article className="metric-card" key={metric.key}>
                <p className="eyebrow">{metric.label}</p>
                <h3>{metric.value}</h3>
                <p>{metric.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="validation-panel" aria-label="Community League journey">
          <div>
            <p className="eyebrow">Supporter Journey</p>
            <h2>From club discovery to verified action and league position.</h2>
          </div>

          <ul className="validation-list">
            {snapshot.journeyCards.map((card) => (
              <li key={card.key}>
                <Link href={card.href}>
                  Step {card.step}: {card.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="validation-panel" aria-label="Trust and proof surfaces">
          <div>
            <p className="eyebrow">Trust and Proof</p>
            <h2>Evidence, moderation, activity and impact stay visible.</h2>
          </div>

          <div className="card-grid">
            {snapshot.trustCards.map((card) => (
              <article className="metric-card" key={card.key}>
                <p className="eyebrow">{card.title}</p>
                <p>{card.summary}</p>
                <Link href={card.href}>Open surface</Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}