export const dynamic = 'force-dynamic';

const navigationChecks = [
  'Foundation routes',
  'Supporter journey routes',
  'Competition engine routes',
  'Proof and trust routes',
  'Admin command routes',
  'API route map',
  'Acceptance chain dependency',
  'Navigation readiness state',
];

export default function NavigationRouteMapFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="navigation-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-023 Navigation</p>
          <h1 id="navigation-title">Navigation shell and product route map surface.</h1>
          <p className="hero-copy">
            This surface converts the accepted Community League pages and APIs into one visible
            product route map for foundation, supporter journey, competition, proof and admin command.
          </p>
        </header>

        <section className="validation-panel" aria-label="Navigation shell and product route map readiness">
          <div>
            <p className="eyebrow">Route Map Foundation</p>
            <h2>Navigation is connected to every accepted product route and API surface.</h2>
            <p>
              The live navigation API is available at /api/navigation-map and returns product areas,
              route status, API status, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {navigationChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}