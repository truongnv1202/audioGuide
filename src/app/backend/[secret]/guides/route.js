import { NextResponse } from "next/server";

import { backendNotFound, isValidBackendSecret } from "@/lib/backendAuth";
import { getGuides, resetSampleGuides } from "@/lib/guidesStore";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { secret } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const guides = await getGuides();

  return NextResponse.json({
    data: guides,
    total: guides.length,
  });
}

export async function POST(request, { params }) {
  const { secret } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const body = await request.json().catch(() => ({}));

  if (body.action !== "reset-samples") {
    return NextResponse.json(
      { error: "Unsupported action" },
      { status: 400 },
    );
  }

  const guides = await resetSampleGuides();

  return NextResponse.json({
    data: guides,
    total: guides.length,
  });
}
