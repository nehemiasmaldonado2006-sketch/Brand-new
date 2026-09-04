import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEmailWithAttachment } from "@/lib/gmail-send";

// Accepts a client-generated export (PNG or PDF, rasterized in the
// browser from the Studio canvas) and emails it through the signed-in
// user's own Gmail. The file never touches disk — it's forwarded straight
// from the upload buffer into the Gmail API attachment.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const form = await req.formData();
  const to = String(form.get("to") ?? "");
  const subject = String(form.get("subject") ?? "Marketing piece");
  const message = String(form.get("message") ?? "");
  const file = form.get("file");

  if (!to || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing recipient or file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await sendEmailWithAttachment(session.user.id, {
    to,
    subject,
    body: message || "Attached is the piece we discussed — happy to walk you through it.",
    attachmentBuffer: Buffer.from(arrayBuffer),
    attachmentFilename: file.name,
    attachmentMimeType: file.type || "application/octet-stream",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
