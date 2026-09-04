import fs from "node:fs";
import path from "node:path";
import { gmailClientFor } from "@/lib/google";

function base64Url(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Sends an email through the signed-in user's Gmail, optionally with one
 * attachment loaded from a file under /public. This is a real send (not a
 * mock) — it uses the gmail.modify scope already granted at sign-in.
 */
export async function sendEmailWithAttachment(
  userId: string,
  opts: {
    to: string;
    subject: string;
    body: string;
    attachmentPublicPath?: string; // e.g. "/marketing/flyers/open-house-tropical-blue.jpg"
    attachmentBuffer?: Buffer; // for client-generated exports (PNG/PDF)
    attachmentFilename?: string;
    attachmentMimeType?: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gmail = await gmailClientFor(userId);
  if (!gmail) return { ok: false, error: "Not connected to Gmail" };

  const boundary = "mc_" + Math.random().toString(36).slice(2);
  const lines: string[] = [
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    opts.body,
    "",
  ];

  const resolvedBuffer =
    opts.attachmentBuffer ??
    (opts.attachmentPublicPath
      ? fs.readFileSync(path.join(process.cwd(), "public", opts.attachmentPublicPath))
      : undefined);

  if (resolvedBuffer) {
    const fileBuffer = resolvedBuffer;
    const filename =
      opts.attachmentFilename ??
      (opts.attachmentPublicPath ? path.basename(opts.attachmentPublicPath) : "attachment");
    const mimeType = opts.attachmentMimeType ?? "application/octet-stream";

    lines.push(
      `--${boundary}`,
      `Content-Type: ${mimeType}; name="${filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${filename}"`,
      "",
      fileBuffer.toString("base64"),
      "",
    );
  }

  lines.push(`--${boundary}--`);

  const raw = base64Url(lines.join("\r\n"));

  try {
    await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}
