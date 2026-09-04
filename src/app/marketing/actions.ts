"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmailWithAttachment } from "@/lib/gmail-send";
import { getFlyer } from "@/lib/marketing/flyers";

export async function hideTemplate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const templateKey = String(formData.get("templateKey") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/marketing/flyers");
  if (!templateKey) return;

  await prisma.hiddenTemplate.upsert({
    where: { userId_templateKey: { userId: session.user.id, templateKey } },
    create: { userId: session.user.id, templateKey },
    update: {},
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function sendFlyerToClient(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const key = String(formData.get("key") ?? "");
  const to = String(formData.get("to") ?? "").trim();
  const message = String(formData.get("message") ?? "");
  const flyer = getFlyer(key);
  if (!flyer || !to) redirect(`/marketing/flyers/${key}?sendError=${encodeURIComponent("Missing recipient")}`);

  const result = await sendEmailWithAttachment(session.user.id, {
    to,
    subject: flyer!.name,
    body: message || `Attached is the flyer we discussed — happy to walk you through it.\n\n${session.user.name ?? ""}`,
    attachmentPublicPath: flyer!.src,
    attachmentFilename: `${flyer!.key}.jpg`,
    attachmentMimeType: "image/jpeg",
  });

  if (!result.ok) {
    redirect(`/marketing/flyers/${key}?sendError=${encodeURIComponent(result.error)}`);
  }
  redirect(`/marketing/flyers/${key}?sent=1`);
}
