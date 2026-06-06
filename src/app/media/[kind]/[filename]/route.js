import { NextResponse } from "next/server";

import { getMediaContentType, readMediaFile } from "@/lib/mediaStore";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { kind, filename } = await params;
  const file = await readMediaFile(kind, filename);

  if (!file) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  return new Response(file, {
    headers: {
      "Content-Type": getMediaContentType(filename),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
