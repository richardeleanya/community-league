export const dynamic = 'force-dynamic';

const impactChecks = [
  'Legacy project table readiness',
  'Project type and project status enums',
  'Legacy map pin table readiness',
  'Approved GPS action impact pins',
  'Legacy points output',
  'Club-linked impact locations',
  'Proof references for impact pins',
  'Awards foundation dependency',
];

export default function LegacyImpactMapFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="impact-map-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-019 Legacy Impact</p>
          <h1 id="impact-map-title">Legacy project and impact map surface.</h1>
          <p className="hero-copy">
            This surface turns approved GPS actions, legacy points, project records and map pins
            into a visible community impact layer.
          </p>
        </header>

        <section className="validation-panel" aria-label="Legacy project and impact map readiness">
          <div>
            <p className="eyebrow">Impact Map Foundation</p>
            <h2>Legacy impact is connected to actions, clubs, projects and mapped proof.</h2>
            <p>
              The live impact API is available at /api/legacy-impact and returns legacy project
              cards, impact pins, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {impactChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}