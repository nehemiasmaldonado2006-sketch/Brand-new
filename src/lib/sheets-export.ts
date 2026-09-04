import { sheetsClientFor } from "@/lib/google";

/**
 * Creates a new Google Sheet in the signed-in user's Drive (via the
 * drive.file scope, so this app can only see files it creates itself),
 * writes the given rows starting at A1, and returns its URL. This is an
 * on-demand "export my numbers" action, not a live sync — each export
 * makes a fresh sheet.
 */
export async function exportToSheet(
  userId: string,
  title: string,
  rows: (string | number)[][],
): Promise<{ url: string } | { error: string }> {
  const sheets = await sheetsClientFor(userId);
  if (!sheets) return { error: "Not connected to Google" };

  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{ properties: { title: "Sheet1" } }],
    },
  });

  const spreadsheetId = created.data.spreadsheetId;
  const url = created.data.spreadsheetUrl;
  if (!spreadsheetId || !url) return { error: "Could not create spreadsheet" };

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });

  return { url };
}
