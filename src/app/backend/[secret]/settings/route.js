import { NextResponse } from "next/server";

import { backendNotFound, isValidBackendSecret } from "@/lib/backendAuth";
import { getSiteSettings, updateSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { secret } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ data: settings });
}

export async function PATCH(request, { params }) {
  const { secret } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  try {
    const settings = await updateSiteSettings(payload);
    return NextResponse.json({ data: settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
