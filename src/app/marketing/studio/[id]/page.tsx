import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Studio, type StudioDoc } from "@/components/marketing/Studio";
import type { MarketingPage } from "@/lib/marketing/types";

export const dynamic = "force-dynamic";

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const doc = await prisma.marketingDoc.findUnique({ where: { id } });
  if (!doc || doc.userId !== session.user.id) notFound();

  const studioDoc: StudioDoc = {
    id: doc.id,
    kind: doc.kind === "cma" ? "cma" : "presentation",
    name: doc.name,
    pages: doc.pages as unknown as MarketingPage[],
    paletteIndex: doc.paletteIndex,
    useCustom: doc.useCustom,
    customBg: doc.customBg,
    customFg: doc.customFg,
    customAccent: doc.customAccent,
  };

  const libraryHref = doc.kind === "cma" ? "/marketing/cma" : "/marketing/presentations";

  return <Studio doc={studioDoc} libraryHref={libraryHref} />;
}
