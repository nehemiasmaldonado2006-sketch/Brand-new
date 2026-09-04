"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exportToSheet } from "@/lib/sheets-export";
import { getMarketEntryByArea, getListings } from "@/lib/data/market";

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

export async function exportMarketData(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const area = String(formData.get("area") ?? "").trim();
  const tab = String(formData.get("tab") ?? "active") === "closed" ? "closed" : "active";
  if (!area) redirect("/market");

  const entry = await getMarketEntryByArea(session.user.id, area);
  const listings = entry ? await getListings(entry.id, tab) : [];

  const rows: (string | number)[][] = [
    ["Area", area],
    ["Median list", entry?.medianList ?? ""],
    ["Median closed", entry?.medianClosed ?? ""],
    ["Days on market", entry?.daysOnMarket ?? ""],
    ["$ / sq ft", entry?.pricePerSqft ?? ""],
    ["Months of supply", entry?.monthsSupply ?? ""],
    [],
    ["Status", "Address", "MLS #", "Price", "Specs", "Note", "Sold date"],
    ...listings.map((l) => [
      l.status,
      l.address,
      l.mlsNumber ?? "",
      l.price ?? "",
      l.specs ?? "",
      l.note ?? "",
      l.soldAt ? l.soldAt.toISOString().slice(0, 10) : "",
    ]),
  ];

  const result = await exportToSheet(
    session.user.id,
    `Mission Control — Market Desk — ${area} — ${new Date().toLocaleDateString("en-US")}`,
    rows,
  );

  if ("error" in result) {
    redirect(`/market?area=${encodeURIComponent(area)}&tab=${tab}&sheetError=${encodeURIComponent(result.error)}`);
  }
  redirect(`/market?area=${encodeURIComponent(area)}&tab=${tab}&sheet=${encodeURIComponent(result.url)}`);
}
