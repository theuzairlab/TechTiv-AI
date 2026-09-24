import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/leads-api";
import { listAdminClients } from "@/lib/admin/clients";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const search = new URL(request.url).searchParams.get("q") ?? undefined;
  const clients = await listAdminClients(search);
  return NextResponse.json({ clients });
}
