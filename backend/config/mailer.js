import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends a 6-digit OTP to the recipient's email address using Brevo Transactional Email API.
 * @param {string} email - Recipient email
 * @param {string} otp - 6-Digit OTP code
 * @param {string} purpose - 'VERIFICATION' or 'PASSWORD_RESET'
 */
export const sendOTPEmail = async (email, otp, purpose = 'VERIFICATION') => {
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;
  const senderEmail = process.env.EMAIL_FROM || 'bhatrakshita05@gmail.com';

  if (!apiKey) {
    const err = 'BREVO_API_KEY is not defined in the backend environment configuration.';
    console.error('[Mailer] Email send failure:', err);
    throw new Error(err);
  }

  const subject = purpose === 'VERIFICATION' 
    ? 'AI SOC Workstation - 6-Digit Verification OTP' 
    : 'AI SOC Workstation - Password Reset OTP';

  const bodyHtml = `
    <div style="font-family: monospace; background-color: #0F172A; color: #E2E8F0; padding: 30px; border-radius: 8px; border: 1px solid #1E293B;">
      <h2 style="color: #2563EB; border-bottom: 1px solid #1E293B; padding-bottom: 10px; margin-top: 0;">AI SOC GATEWAY</h2>
      <p style="font-size: 13px;">A security verification action was requested for your analyst profile.</p>
      <p style="font-size: 12px; color: #94A3B8;">Action Type: <strong>${purpose === 'VERIFICATION' ? 'NEW USER ENROLLMENT' : 'PASSWORD RESET'}</strong></p>
      <div style="margin: 25px 0; padding: 20px; background-color: #090D16; border: 1px dashed #2563EB; text-align: center; border-radius: 4px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #10B981;">${otp}</span>
      </div>
      <p style="font-size: 11px; color: #EF4444;">This passcode is valid for 5 minutes and will expire afterwards.</p>
      <p style="font-size: 10px; color: #94A3B8; border-top: 1px solid #1E293B; padding-top: 15px; margin-top: 20px;">
        DO NOT share this verification code. SOC administrators will never request this passcode.
      </p>
    </div>
  `;

  console.log(`[Mailer] Dispatching transactional email via Brevo API to: ${email}`);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'AI SOC Gateway',
          email: senderEmail
        },
        to: [
          {
            email: email,
            name: email.split('@')[0]
          }
        ],
        subject: subject,
        htmlContent: bodyHtml
      })
    });

    const responseData = await response.json().catch(() => ({}));
    console.log('[Mailer] Brevo API response status:', response.status);

    if (!response.ok) {
      const errorMsg = responseData.message || responseData.error || 'Unknown Brevo API error';
      const fullError = `Brevo API HTTP ${response.status}: ${errorMsg}`;
      console.error('[Mailer] Email send failure:', fullError, responseData);
      throw new Error(fullError);
    }

    console.log(`[Mailer] OTP successfully delivered to ${email} via Brevo API.`);
    return true;
  } catch (error) {
    console.error('[Mailer] Email send failure:', error.message);
    throw new Error(`Transactional Email API Error: ${error.message}`);
  }
};
