"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
