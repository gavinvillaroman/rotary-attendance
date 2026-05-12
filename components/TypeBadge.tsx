function classFor(type: string | null): string {
  if (!type) return "badge badge-muted";
  switch (type) {
    case "Weekly Meeting":
      return "badge badge-type-weekly";
    case "Board Meeting":
      return "badge badge-type-board";
    case "Fundraiser":
      return "badge badge-type-fundraiser";
    case "Social":
      return "badge badge-type-social";
    case "Service Project":
      return "badge badge-type-service";
    default:
      return "badge";
  }
}

export function TypeBadge({ type }: { type: string | null }) {
  if (!type) return null;
  return <span className={classFor(type)}>{type}</span>;
}

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="badge badge-muted">—</span>;
  if (status === "Active")
    return <span className="badge badge-success">Active</span>;
  if (status === "Honorary")
    return <span className="badge badge-honorary">Honorary</span>;
  return <span className="badge badge-muted">{status}</span>;
}
