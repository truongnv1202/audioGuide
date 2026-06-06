import { NextResponse } from "next/server";

const DEFAULT_SECRET = "change-this-backend-secret";

export function isValidBackendSecret(secret) {
  return secret === (process.env.BACKEND_SECRET || DEFAULT_SECRET);
}

export function backendNotFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
