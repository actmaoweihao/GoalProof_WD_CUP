import { Link } from "react-router-dom";

export function ActionHint({
  title,
  description,
  primary,
  secondary,
  tone = "normal"
}: {
  title: string;
  description: string;
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
  tone?: "normal" | "error";
}) {
  return (
    <div className={tone === "error" ? "action-hint action-hint-error" : "action-hint"}>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {(primary || secondary) && (
        <div className="action-hint-buttons">
          {primary && (
            <Link className="button button-primary" to={primary.to}>
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link className="button button-secondary" to={secondary.to}>
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
