import { NextResponse } from "next/server";

import { backendNotFound, isValidBackendSecret } from "@/lib/backendAuth";
import { getGuideById, updateGuideById } from "@/lib/guidesStore";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { secret, id } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const guide = await getGuideById(id);

  if (!guide) {
    return backendNotFound();
  }

  return NextResponse.json({ data: guide });
}

export async function PUT(request, { params }) {
  return updateGuide(request, params);
}

export async function PATCH(request, { params }) {
  return updateGuide(request, params);
}

async function updateGuide(request, paramsPromise) {
  const { secret, id } = await paramsPromise;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 },
    );
  }

  const guide = await updateGuideById(id, payload);

  if (!guide) {
    return backendNotFound();
  }

  return NextResponse.json({ data: guide });
}
