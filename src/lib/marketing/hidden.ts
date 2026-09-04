import { prisma } from "@/lib/prisma";

export async function getHiddenTemplateKeys(userId: string): Promise<Set<string>> {
  const rows = await prisma.hiddenTemplate.findMany({
    where: { userId },
    select: { templateKey: true },
  });
  return new Set(rows.map((r) => r.templateKey));
}
