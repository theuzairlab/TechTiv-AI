import { GlassPanel } from "@/components/ui/glass-panel";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

export function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-3">
        <p className="s-label">— Admin</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-text-muted">{description}</p>
      </div>

      <GlassPanel variant="elevated" className="p-8 text-center">
        <p className="text-sm text-text-muted">
          Data tables and management UI will be wired in Phase 2 when public
          forms and discovery connect to PostgreSQL.
        </p>
      </GlassPanel>
    </div>
  );
}
