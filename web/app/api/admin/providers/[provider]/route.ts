import { NextResponse } from "next/server";
import { updateProviderConfig } from "@/lib/admin/providers";
import { requireAdminApi } from "@/lib/leads-api";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { provider } = await context.params;

  let body: {
    isEnabled?: boolean;
    monthlyBudgetUSD?: number;
    resetSpend?: boolean;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    body.isEnabled === undefined &&
    body.monthlyBudgetUSD === undefined &&
    !body.resetSpend
  ) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  if (
    body.monthlyBudgetUSD !== undefined &&
    (typeof body.monthlyBudgetUSD !== "number" ||
      body.monthlyBudgetUSD < 0 ||
      !Number.isFinite(body.monthlyBudgetUSD))
  ) {
    return NextResponse.json(
      { error: "monthlyBudgetUSD must be a non-negative number" },
      { status: 400 },
    );
  }

  try {
    const updated = await updateProviderConfig(
      decodeURIComponent(provider),
      body,
      auth.session.user.id,
    );
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update provider";
    const status = message.startsWith("Provider not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
