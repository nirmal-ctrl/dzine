import Mailjet from 'node-mailjet';

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_SECRET_KEY!
);

export async function sendLicenseEmail(email: string, name: string, licenseKey: string) {
  try {
    const result = await mailjet.post("send", { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL!,
            Name: process.env.MAILJET_FROM_NAME!,
          },
          To: [
            {
              Email: email,
              Name: name,
            },
          ],
          Subject: "Your Huenxt Lifetime License Key",
          HTMLPart: `
            <h3>Thank you for purchasing Huenxt Pro!</h3>
            <p>Hi ${name},</p>
            <p>Your payment has been successfully processed. Here is your lifetime license key:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px;">
              ${licenseKey}
            </div>
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Open the Huenxt Chrome Extension.</li>
              <li>Go to the activation screen.</li>
              <li>Paste your license key to unlock all premium features.</li>
            </ol>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br />The Huenxt Team</p>
          `,
        },
      ],
    });
    return result.body;
  } catch (error) {
    console.error("Error sending license email:", error);
    throw error;
  }
}
