import { Readable } from "node:stream";

import { google } from "googleapis";

type UploadInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

function getServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  let json = raw.trim();
  // Supporte une valeur base64 ou JSON brut.
  if (!json.startsWith("{")) {
    try {
      json = Buffer.from(json, "base64").toString("utf8");
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON invalide (base64).");
    }
  }

  let parsed: { client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON invalide (JSON).");
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON incomplet (client_email/private_key).");
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

function getAuth() {
  // Préférer OAuth (compte propriétaire du Drive) : fonctionne avec un Drive personnel gratuit.
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (clientId && clientSecret && refreshToken) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    return oauth2;
  }

  // Repli : compte de service (nécessite un Shared Drive/Workspace pour le quota).
  const sa = getServiceAccountCredentials();
  if (sa) {
    return new google.auth.JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
  }

  throw new Error(
    "Configuration Google Drive manquante (OAuth: GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN ou compte de service).",
  );
}

export function isGoogleDriveConfigured() {
  const hasOAuth = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  );
  const hasServiceAccount = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID && (hasOAuth || hasServiceAccount));
}

export async function uploadToGoogleDrive({ buffer, filename, mimeType }: UploadInput) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID manquant.");
  }

  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const created = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  const fileId = created.data.id;
  if (!fileId) {
    throw new Error("Échec de l'upload Google Drive (id manquant).");
  }

  // Rendre le fichier accessible en lecture à toute personne disposant du lien.
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  const file = await drive.files.get({
    fileId,
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  const url =
    file.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

  return { fileId, url };
}
