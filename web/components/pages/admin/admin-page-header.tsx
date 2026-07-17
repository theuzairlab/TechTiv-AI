type AdminPageHeaderProps = {
  label?: string;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
};

export function AdminPageHeader({
  label = "Admin",
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl space-y-2">
        <p className="s-label">— {label}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {description ? <p className="text-sm text-text-muted sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
