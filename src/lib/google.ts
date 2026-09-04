import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

/**
 * Builds an authenticated googleapis OAuth2 client for the given user,
 * using the Google account linked at sign-in (stored by the Prisma
 * adapter). Refreshes the access token when it's expired and persists
 * the refreshed token so the next call doesn't have to.
 */
export async function googleClientFor(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.refresh_token && !account?.access_token) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  const isExpired =
    !account.expires_at || account.expires_at * 1000 < Date.now() + 60_000;

  if (isExpired && account.refresh_token) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date
          ? Math.floor(credentials.expiry_date / 1000)
          : null,
      },
    });
  }

  return oauth2Client;
}

export async function gmailClientFor(userId: string) {
  const auth = await googleClientFor(userId);
  if (!auth) return null;
  return google.gmail({ version: "v1", auth });
}

export async function calendarClientFor(userId: string) {
  const auth = await googleClientFor(userId);
  if (!auth) return null;
  return google.calendar({ version: "v3", auth });
}

export async function sheetsClientFor(userId: string) {
  const auth = await googleClientFor(userId);
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

export async function slidesClientFor(userId: string) {
  const auth = await googleClientFor(userId);
  if (!auth) return null;
  return google.slides({ version: "v1", auth });
}

export async function docsClientFor(userId: string) {
  const auth = await googleClientFor(userId);
  if (!auth) return null;
  return google.docs({ version: "v1", auth });
}

export async function driveClientFor(userId: string) {
  const auth = await googleClientFor(userId);
  if (!auth) return null;
  return google.drive({ version: "v3", auth });
}
