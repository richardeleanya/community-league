import Link from 'next/link';

import type { VisualShellSnapshot } from '@/lib/visual-shell';

type CommunityLeagueShellProps = {
  snapshot: VisualShellSnapshot;
};

export function CommunityLeagueShell({ snapshot }: CommunityLeagueShellProps) {
  const primaryItems = snapshot.navItems.filter((item) => item.isPrimary);

  return (
    <section className="validation-panel" aria-label="Community League unified product shell">
      <div>
        <p className="eyebrow">Unified Product Shell</p>
        <h2>Community League command navigation</h2>
        <p>{snapshot.headline}</p>
      </div>

      <div className="card-grid">
        {snapshot.statusPanels.map((panel) => (
          <article className="metric-card" key={panel.key}>
            <p className="eyebrow">{panel.label}</p>
            <h3>{panel.value}</h3>
            <p>{panel.state.toUpperCase()}</p>
          </article>
        ))}
      </div>

      <nav aria-label="Primary Community League navigation">
        <ul className="validation-list">
          {primaryItems.map((item) => (
            <li key={item.key}>
              <Link href={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="card-grid">
        {snapshot.zones.map((zone) => (
          <article className="metric-card" key={zone.key}>
            <p className="eyebrow">{zone.label}</p>
            <h3>
              {zone.readyItems}/{zone.totalItems}
            </h3>
            <p>{zone.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}