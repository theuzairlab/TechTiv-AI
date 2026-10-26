import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/leads-api";
import { setPaymentsEnabled } from "@/lib/billing/settings";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  let body: { paymentsEnabled?: boolean };
  try {
    body = (await request.json()) as { paymentsEnabled?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.paymentsEnabled !== "boolean") {
    return NextResponse.json(
      { error: "paymentsEnabled must be true or false" },
      { status: 400 },
    );
  }

  try {
    const paymentsEnabled = await setPaymentsEnabled(body.paymentsEnabled);
    return NextResponse.json({ paymentsEnabled });
  } catch (error) {
    console.error("[api/admin/billing]", error);
    return NextResponse.json(
      { error: "Could not update the payments switch" },
      { status: 500 },
    );
  }
}
