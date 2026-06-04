export const dynamic = 'force-dynamic';

const submissionSteps = [
  'Choose action type',
  'Select mission or free community action',
  'Add description and evidence photos',
  'Attach GPS proof and date',
  'Submit for tiered verification',
  'Await points and XP award',
];

export default function SubmitActionFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="submit-action-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-010 Action Submission</p>
          <h1 id="submit-action-title">Submit a verified community action.</h1>
          <p className="hero-copy">
            This surface turns the supporter dashboard into the first action submission foundation:
            action type, mission context, description, GPS proof, photo evidence and server-side
            validation.
          </p>
        </header>

        <section className="validation-panel" aria-label="Action submission foundation readiness">
          <div>
            <p className="eyebrow">Submission Foundation</p>
            <h2>Community action submission is now represented as a validated foundation service.</h2>
            <p>
              The live action submission API is available at /api/action-submission and returns
              action types, active missions, submission limits, readiness checks and validation
              results for draft submissions.
            </p>
          </div>

          <ul className="validation-list">
            {submissionSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}