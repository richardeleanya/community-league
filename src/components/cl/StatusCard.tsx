import type { FoundationStep } from '@/lib/app/foundation';

type StatusCardProps = {
  step: FoundationStep;
};

export function StatusCard({ step }: StatusCardProps) {
  return (
    <article className={`status-card status-card--${step.state}`}>
      <div className="status-card__header">
        <span className="status-card__id">{step.id}</span>
        <span className="status-card__state">{step.state}</span>
      </div>
      <h3>{step.label}</h3>
      <p>{step.summary}</p>
      <small>{step.proof}</small>
    </article>
  );
}