import { NextResponse } from "next/server";

import { getCandleCount, incrementCandleCount } from "@/lib/candleStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getCandleCount();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const count = await incrementCandleCount();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
