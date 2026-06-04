export const dynamic = 'force-dynamic';

const onboardingSteps = [
  'Create secure account',
  'Verify email and account status',
  'Choose supporter username',
  'Select club identity',
  'Enter community action journey',
];

export default function OnboardingFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="onboarding-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-007 Onboarding Foundation</p>
          <h1 id="onboarding-title">Registration and profile onboarding</h1>
          <p className="hero-copy">
            This surface turns the accepted account foundation into a controlled onboarding path:
            account creation, email verification, username readiness, club selection and entry into
            verified community action.
          </p>
        </header>

        <section className="validation-panel" aria-label="Onboarding foundation readiness">
          <div>
            <p className="eyebrow">Profile Onboarding Layer</p>
            <h2>Supporter onboarding is now represented as a staged operating flow.</h2>
            <p>
              The live onboarding API is available at /api/onboarding-foundation and returns the
              current onboarding stage, username rules, club selection options and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {onboardingSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}