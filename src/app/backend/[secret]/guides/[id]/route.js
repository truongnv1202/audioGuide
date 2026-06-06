import { NextResponse } from "next/server";

import { getGuideById } from "@/data/seed";
import { backendNotFound, isValidBackendSecret } from "@/lib/backendAuth";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { secret, id } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const guide = getGuideById(id);

  if (!guide) {
    return backendNotFound();
  }

  return NextResponse.json({ data: guide });
}
