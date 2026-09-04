"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addContentIdea(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const type = String(formData.get("type") ?? "Reel");
  const title = String(formData.get("title") ?? "").trim();
  const script = String(formData.get("script") ?? "").trim();
  if (!title) return;

  await prisma.contentIdea.create({
    data: { userId: session.user.id, type, title, script },
  });

  revalidatePath("/content");
}

export async function updateContentStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "Idea");
  const idea = await prisma.contentIdea.findUnique({ where: { id } });
  if (!idea || idea.userId !== session.user.id) throw new Error("Not found");

  await prisma.contentIdea.update({ where: { id }, data: { status } });
  revalidatePath("/content");
  revalidatePath(`/content/${id}`);
}

export async function deleteContentIdea(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const id = String(formData.get("id") ?? "");
  const idea = await prisma.contentIdea.findUnique({ where: { id } });
  if (!idea || idea.userId !== session.user.id) throw new Error("Not found");

  await prisma.contentIdea.delete({ where: { id } });
  revalidatePath("/content");
  redirect("/content");
}
