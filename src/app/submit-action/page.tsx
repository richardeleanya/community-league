const evidenceRules = [
  'Show what was done.',
  'Show which club the action supports.',
  'Use clear proof: photo, organiser confirmation, receipt, or volunteer record.',
  'Submit only genuine evidence.',
];

export default function SubmitActionPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="submit-title">
        <header className="hero-panel__header">
          <p className="eyebrow">Submit Action</p>
          <h1 id="submit-title">Submit evidence so points can be verified.</h1>
          <p className="hero-copy">
            A community action becomes league points only after evidence is checked. This keeps the
            competition fair for every club.
          </p>
        </header>

        <section className="validation-panel" aria-label="Evidence and verification explanation">
          <p className="eyebrow">Fairness protection</p>
          <h2>Proof protects the league table.</h2>
          <p>
            Verification happens before points. The review step confirms that the action happened
            and that the right club receives credit.
          </p>
        </section>

        <section className="surface-grid" aria-label="Evidence rules">
          {evidenceRules.map((rule) => (
            <article className="info-card" key={rule}>
              <h2>{rule}</h2>
              <p>Use this rule before submitting evidence for review.</p>
            </article>
          ))}
        </section>

        <section className="validation-panel" aria-label="Submit action form placeholder">
          <p className="eyebrow">Submission pathway</p>
          <h2>Ready to submit?</h2>
          <p>
            Use the submission process when your mission is complete and your proof is ready.
            Verified actions become trusted league points.
          </p>
          <a className="primary-action" href="/verification-queue">
            View verification queue
          </a>
        </section>
      </section>
    </main>
  );
}