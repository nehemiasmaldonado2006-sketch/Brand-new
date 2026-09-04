"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MarketingPage } from "@/lib/marketing/types";
import { exportDocToSlides, exportDocToDocs } from "@/lib/marketing/slides-export";

async function requireOwnedDoc(docId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");
  const doc = await prisma.marketingDoc.findUnique({ where: { id: docId } });
  if (!doc || doc.userId !== session.user.id) throw new Error("Not found");
  return { userId: session.user.id, doc };
}

export async function saveDoc(
  docId: string,
  data: {
    name: string;
    paletteIndex: number | null;
    useCustom: boolean;
    customBg?: string | null;
    customFg?: string | null;
    customAccent?: string | null;
    pages: MarketingPage[];
  },
) {
  await requireOwnedDoc(docId);
  await prisma.marketingDoc.update({
    where: { id: docId },
    data: {
      name: data.name,
      paletteIndex: data.paletteIndex,
      useCustom: data.useCustom,
      customBg: data.customBg ?? null,
      customFg: data.customFg ?? null,
      customAccent: data.customAccent ?? null,
      pages: JSON.parse(JSON.stringify(data.pages)),
    },
  });
  revalidatePath(`/marketing/studio/${docId}`);
  return { ok: true };
}

export async function saveDocToLibrary(docId: string) {
  await requireOwnedDoc(docId);
  await prisma.marketingDoc.update({ where: { id: docId }, data: { savedToLibrary: true } });
  revalidatePath(`/marketing/studio/${docId}`);
  return { ok: true };
}

export async function exportDocToGoogle(
  docId: string,
  kind: "presentation" | "cma",
  name: string,
  pages: MarketingPage[],
) {
  const { userId } = await requireOwnedDoc(docId);
  return kind === "cma" ? exportDocToDocs(userId, name, pages) : exportDocToSlides(userId, name, pages);
}

export async function deleteDocAction(formData: FormData) {
  const docId = String(formData.get("docId") ?? "");
  const kind = String(formData.get("kind") ?? "presentation");
  await requireOwnedDoc(docId);
  await prisma.marketingDoc.delete({ where: { id: docId } });
  revalidatePath(`/marketing/${kind === "cma" ? "cma" : "presentations"}`);
  redirect(`/marketing/${kind === "cma" ? "cma" : "presentations"}`);
}
