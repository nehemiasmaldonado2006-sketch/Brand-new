"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exportToSheet } from "@/lib/sheets-export";
import { getRateHistory } from "@/lib/data/rate";

export async function logRate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const rate30 = Number(formData.get("rate30"));
  const rate15 = Number(formData.get("rate15"));
  const fha30Raw = formData.get("fha30");
  const fha30 = fha30Raw ? Number(fha30Raw) : null;

  if (!isFinite(rate30) || !isFinite(rate15) || rate30 <= 0 || rate15 <= 0) {
    throw new Error("Enter valid rates");
  }

  await prisma.rateEntry.create({
    data: { userId: session.user.id, rate30, rate15, fha30 },
  });

  revalidatePath("/rate");
  revalidatePath("/");
}

export async function exportRateHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const history = await getRateHistory(session.user.id, 500);
  const rows: (string | number)[][] = [
    ["Date", "30-year rate %", "15-year rate %", "FHA 30 %"],
    ...history
      .slice()
      .reverse()
      .map((h) => [
        h.loggedAt.toISOString().slice(0, 10),
        h.rate30,
        h.rate15,
        h.fha30 ?? "",
      ]),
  ];

  const result = await exportToSheet(
    session.user.id,
    `Mission Control — Rate History — ${new Date().toLocaleDateString("en-US")}`,
    rows,
  );

  if ("error" in result) {
    redirect(`/rate?sheetError=${encodeURIComponent(result.error)}`);
  }
  redirect(`/rate?sheet=${encodeURIComponent(result.url)}`);
}
