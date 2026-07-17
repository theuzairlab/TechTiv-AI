import { GlassPanel } from "@/components/ui/glass-panel";

type UserPlaceholderPageProps = {
  title: string;
  description: string;
};

export function UserPlaceholderPage({ title, description }: UserPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-3">
        <p className="s-label">— Your portal</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-text-muted">{description}</p>
      </div>

      <GlassPanel variant="elevated" className="p-8 text-center">
        <p className="text-sm text-text-muted">
          Your saved items will appear here once the platform data layer is
          connected in the next phase.
        </p>
      </GlassPanel>
    </div>
  );
}
