import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTemplate, pageSet, type DocKind } from "@/lib/marketing/templates";
import { seedPages } from "@/lib/marketing/seed";

export const dynamic = "force-dynamic";

export default async function NewStudioDocPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; template?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { kind: kindRaw, template: templateKey } = await searchParams;
  const kind: DocKind = kindRaw === "cma" ? "cma" : "presentation";
  const template = templateKey ? getTemplate(templateKey) : undefined;

  const names = pageSet(kind);
  const docName = template?.name ?? (kind === "cma" ? "New CMA" : "New Presentation");

  const doc = await prisma.marketingDoc.create({
    data: {
      userId: session.user.id,
      kind,
      name: docName,
      templateKey: template?.key,
      paletteIndex: null,
      useCustom: false,
      pages: JSON.parse(JSON.stringify(seedPages(names, docName))),
    },
  });

  redirect(`/marketing/studio/${doc.id}`);
}
