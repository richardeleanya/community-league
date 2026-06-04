import { createCommunityLeagueRuntimeSmokeService } from '@/lib/runtime-smoke';

export const dynamic = 'force-dynamic';

export default function RuntimeSmokeVerificationPage() {
  const service = createCommunityLeagueRuntimeSmokeService();
  const snapshot = service.getRuntimeSmokeSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="runtime-smoke-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-027 Runtime Smoke</p>
          <h1 id="runtime-smoke-title">End-to-end route smoke and local runtime verification.</h1>
          <p className="hero-copy">
            This surface lists the page and API routes that must respond from a real local Next
            runtime before the product foundation can move forward.
          </p>
        </header>

        <section className="validation-panel" aria-label="Runtime smoke expected routes">
          <div>
            <p className="eyebrow">Runtime Routes</p>
            <h2>{snapshot.headline}</h2>
          </div>

          <ul className="validation-list">
            {snapshot.expectedRoutes.map((route) => (
              <li key={route.key}>
                {route.type.toUpperCase()} {route.path} expects {route.expectedStatus}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}