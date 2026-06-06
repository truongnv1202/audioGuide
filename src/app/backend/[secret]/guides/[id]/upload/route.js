import { NextResponse } from "next/server";

import { backendNotFound, isValidBackendSecret } from "@/lib/backendAuth";
import { getGuideById, updateGuideById } from "@/lib/guidesStore";
import { saveGuideUpload } from "@/lib/mediaStore";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const { secret, id } = await params;

  if (!isValidBackendSecret(secret)) {
    return backendNotFound();
  }

  const currentGuide = await getGuideById(id);

  if (!currentGuide) {
    return backendNotFound();
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      { error: "Request must be multipart/form-data" },
      { status: 400 },
    );
  }

  const updates = {};
  const uploaded = {};

  for (const fieldName of ["image", "audio"]) {
    const file = formData.get(fieldName);

    if (!file || typeof file.arrayBuffer !== "function") {
      continue;
    }

    try {
      const result = await saveGuideUpload(id, fieldName, file);

      if (result) {
        updates[result.field] = result.url;
        uploaded[fieldName] = result.url;
      }
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Upload field image or audio is required" },
      { status: 400 },
    );
  }

  const guide = await updateGuideById(id, updates);

  return NextResponse.json({
    data: guide,
    uploaded,
  });
}
