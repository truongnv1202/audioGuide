import { NextResponse } from "next/server";

import { guides } from "@/data/seed";
import { backendNotFound, isValidBackendSecret } from "@/lib/backendAuth";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { secret } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  return NextResponse.json({
    data: guides,
    total: guides.length,
  });
}
