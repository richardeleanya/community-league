export const dynamic = 'force-dynamic';

const readinessItems = [
  'Supabase Auth session bridge',
  'Public users account table readiness',
  'Supporter profile account link readiness',
  'Account lockout and session policy settings',
  'Admin and moderator flag readiness',
];

export default function AccountFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="account-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-006 Account Foundation</p>
          <h1 id="account-title">Authentication and account readiness</h1>
          <p className="hero-copy">
            This surface confirms that the accepted Supabase, Prisma, domain and application
            foundations now have a controlled account layer ready for registration, profile and
            protected-workflow phases.
          </p>
        </header>

        <section className="validation-panel" aria-label="Account foundation readiness">
          <div>
            <p className="eyebrow">Account Service Layer</p>
            <h2>Session, profile and policy checks are now represented as one account foundation.</h2>
            <p>
              The live account API is available at /api/account-foundation and returns the current
              session state, account counts, authentication policy settings and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {readinessItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}