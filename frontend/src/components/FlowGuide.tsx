import { Link } from "react-router-dom";

export type FlowStep = {
  title: string;
  description: string;
  to?: string;
  state?: "done" | "active" | "locked";
};

export function FlowGuide({
  eyebrow = "START HERE",
  title,
  steps,
  compact = false
}: {
  eyebrow?: string;
  title: string;
  steps: FlowStep[];
  compact?: boolean;
}) {
  return (
    <section className={compact ? "flow-guide flow-guide-compact" : "flow-guide"}>
      <div className="flow-guide-head">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="flow-steps">
        {steps.map((step, index) => {
          const content = (
            <>
              <i>{index + 1}</i>
              <span>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </span>
            </>
          );
          const className = `flow-step ${step.state ? `is-${step.state}` : ""}`;
          return step.to ? (
            <Link className={className} key={step.title} to={step.to}>
              {content}
            </Link>
          ) : (
            <div className={className} key={step.title}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function NextActionCard({
  eyebrow = "NEXT STEP",
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: Array<{ label: string; to?: string; href?: string }>;
}) {
  return (
    <section className="next-action-card">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions && actions.length > 0 && (
        <div className="next-action-buttons">
          {actions.map((action) =>
            action.to ? (
              <Link className="button button-primary" key={action.label} to={action.to}>
                {action.label}
              </Link>
            ) : (
              <a className="button button-secondary" href={action.href} key={action.label}>
                {action.label}
              </a>
            )
          )}
        </div>
      )}
    </section>
  );
}
