import { prisma } from "@/lib/prisma";

export async function getLatestRate(userId: string) {
  return prisma.rateEntry.findFirst({
    where: { userId },
    orderBy: { loggedAt: "desc" },
  });
}

export async function getRateHistory(userId: string, limit = 12) {
  return prisma.rateEntry.findMany({
    where: { userId },
    orderBy: { loggedAt: "desc" },
    take: limit,
  });
}

export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (!principal || !annualRatePct || !isFinite(principal) || !isFinite(r) || r <= 0) return null;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}
