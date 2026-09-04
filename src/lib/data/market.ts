import { prisma } from "@/lib/prisma";

export async function getLatestMarketEntry(userId: string) {
  return prisma.marketEntry.findFirst({
    where: { userId },
    orderBy: { loggedAt: "desc" },
  });
}

export async function getMarketEntryByArea(userId: string, area: string) {
  return prisma.marketEntry.findFirst({
    where: { userId, area: { equals: area } },
    orderBy: { loggedAt: "desc" },
    include: { listings: true },
  });
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 182;

export async function getListings(marketEntryId: string, status: "active" | "closed") {
  if (status === "active") {
    return prisma.listing.findMany({
      where: { marketEntryId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
  }
  return prisma.listing.findMany({
    where: {
      marketEntryId,
      status: "closed",
      soldAt: { gte: new Date(Date.now() - SIX_MONTHS_MS) },
    },
    orderBy: { soldAt: "desc" },
  });
}
