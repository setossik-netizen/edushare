import { Readable } from "node:stream";

import { google } from "googleapis";

type UploadInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON manquant.");
  }

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

export function isGoogleDriveConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_DRIVE_FOLDER_ID);
}

export async function uploadToGoogleDrive({ buffer, filename, mimeType }: UploadInput) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID manquant.");
  }

  const credentials = getCredentials();
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

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
