export const dynamic = 'force-dynamic';

const activityChecks = [
  'Notification feed rows',
  'Unread notification state',
  'Notification type enum catalogue',
  'Audit log proof trail',
  'Community action timeline',
  'Approved action signal',
  'Proof references for feed items',
  'Legacy impact foundation dependency',
];

export default function ActivityFeedFoundationPage() {
  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="activity-feed-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-020 Activity Feed</p>
          <h1 id="activity-feed-title">Notification and activity feed surface.</h1>
          <p className="hero-copy">
            This surface turns notifications, audit trail records and community actions into a
            proof-linked live activity feed.
          </p>
        </header>

        <section className="validation-panel" aria-label="Notification and activity feed readiness">
          <div>
            <p className="eyebrow">Activity Foundation</p>
            <h2>Activity is connected to notifications, audit events and action evidence.</h2>
            <p>
              The live activity API is available at /api/activity-feed and returns notifications,
              audit events, action events, counts and readiness checks.
            </p>
          </div>

          <ul className="validation-list">
            {activityChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}