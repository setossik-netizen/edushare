/**
 * Envoi d'email transactionnel, optionnel.
 *
 * Si RESEND_API_KEY n'est pas défini, l'envoi est silencieusement ignoré :
 * les notifications in-app restent la source de vérité.
 */
export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.EMAIL_FROM ?? "EduShare <noreply@edushare.app>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      console.error("[email] Resend:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[email] send failed:", error);
    return false;
  }
}
