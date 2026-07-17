import { AdminProvidersManager } from "@/components/pages/admin/admin-providers-manager";
import { listProviderMonitorRows } from "@/lib/admin/providers";

export async function AdminProvidersPageView() {
  const providers = await listProviderMonitorRows();
  return <AdminProvidersManager initialProviders={providers} />;
}
