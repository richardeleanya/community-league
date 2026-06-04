import { CommunityLeagueShell } from '@/components/community-league-shell';
import { createCommunityLeagueVisualShellService } from '@/lib/visual-shell';

export const dynamic = 'force-dynamic';

export default function VisualShellFoundationPage() {
  const service = createCommunityLeagueVisualShellService();
  const snapshot = service.getVisualShellSnapshot();

  return (
    <main className="main-shell">
      <section className="hero-panel" aria-labelledby="visual-shell-title">
        <header className="hero-panel__header">
          <p className="eyebrow">CL-024 Visual Shell</p>
          <h1 id="visual-shell-title">Visual shell and unified product navigation surface.</h1>
          <p className="hero-copy">
            This surface connects the accepted product route map into one user-facing shell for
            foundation, supporter journey, competition, proof and admin command.
          </p>
        </header>

        <CommunityLeagueShell snapshot={snapshot} />

        <section className="validation-panel" aria-label="Visual shell readiness">
          <div>
            <p className="eyebrow">Shell API</p>
            <h2>Unified navigation is available through /api/visual-shell.</h2>
            <p>
              The API returns navigation items, product zones, status panels and readiness checks
              for the accepted Community League product shell.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}