import { notFound } from "next/navigation";

import BackendEditor from "@/components/BackendEditor";
import { isValidBackendSecret } from "@/lib/backendAuth";
import { getGuides } from "@/lib/guidesStore";
import { getSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export default async function BackendPage({ params }) {
  const { secret } = await params;

  if (!isValidBackendSecret(secret)) {
    notFound();
  }

  const [guides, settings] = await Promise.all([getGuides(), getSiteSettings()]);

  return (
    <BackendEditor secret={secret} initialGuides={guides} initialSettings={settings} />
  );
}
