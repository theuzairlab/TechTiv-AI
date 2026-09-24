import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";

type AdminEmptyModuleProps = {
  label: string;
  title: string;
  description: string;
  columns: string[];
};

export function AdminEmptyModule({
  label,
  title,
  description,
  columns,
}: AdminEmptyModuleProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader label={label} title={title} description={description} />
      <GlassPanel className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-subtle text-[10px] uppercase tracking-wide text-text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-text-primary">No records yet</p>
          <p className="mt-2 text-sm text-text-muted">
            This module is live. Rows appear here as soon as billing, subscriptions,
            or voice sessions are enabled.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
