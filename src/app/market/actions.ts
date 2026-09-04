"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function num(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (!raw) return null;
  const n = Number(raw);
  return isFinite(n) ? n : null;
}

export async function runAreaReport(formData: FormData) {
  const area = String(formData.get("area") ?? "").trim();
  if (!area) return;
  redirect(`/market?area=${encodeURIComponent(area)}`);
}

export async function logMarketStats(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const area = String(formData.get("area") ?? "").trim();
  if (!area) throw new Error("Area is required");

  await prisma.marketEntry.create({
    data: {
      userId: session.user.id,
      area,
      medianList: num(formData, "medianList"),
      medianClosed: num(formData, "medianClosed"),
      daysOnMarket: num(formData, "daysOnMarket"),
      pricePerSqft: num(formData, "pricePerSqft"),
      monthsSupply: num(formData, "monthsSupply"),
    },
  });

  revalidatePath("/market");
  revalidatePath("/");
  redirect(`/market?area=${encodeURIComponent(area)}`);
}

export async function addListing(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const marketEntryId = String(formData.get("marketEntryId") ?? "");
  const area = String(formData.get("area") ?? "");
  const status = String(formData.get("status") ?? "active");
  const soldAtRaw = formData.get("soldAt");

  await prisma.listing.create({
    data: {
      userId: session.user.id,
      marketEntryId: marketEntryId || null,
      status,
      address: String(formData.get("address") ?? ""),
      mlsNumber: String(formData.get("mlsNumber") ?? "") || null,
      price: num(formData, "price"),
      specs: String(formData.get("specs") ?? "") || null,
      note: String(formData.get("note") ?? "") || null,
      photoUrl: String(formData.get("photoUrl") ?? "") || null,
      soldAt: soldAtRaw ? new Date(String(soldAtRaw)) : null,
    },
  });

  revalidatePath("/market");
  redirect(`/market?area=${encodeURIComponent(area)}`);
}
