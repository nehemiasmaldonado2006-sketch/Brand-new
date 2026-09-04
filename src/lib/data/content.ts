import { prisma } from "@/lib/prisma";

export async function getContentIdeas(userId: string) {
  return prisma.contentIdea.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContentIdea(userId: string, id: string) {
  const idea = await prisma.contentIdea.findUnique({ where: { id } });
  if (!idea || idea.userId !== userId) return null;
  return idea;
}
