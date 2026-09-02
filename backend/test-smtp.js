import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.EMAIL_FROM;

console.log('Testing Brevo API key authentication...');
console.log('Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'undefined');
console.log('Sender Email:', senderEmail);

if (!apiKey) {
  console.error('[DIAGNOSTIC] ERROR: BREVO_API_KEY is not set in your .env file!');
  process.exit(1);
}

const testApiConnection = async () => {
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
          name: 'AI SOC Diagnostic Test',
          email: senderEmail || 'bhatrakshita05@gmail.com'
        },
        to: [
          {
            email: 'bhatrakshita05@gmail.com',
            name: 'Diagnostic'
          }
        ],
        subject: 'API Authentication Test',
        htmlContent: '<h4>Diagnostic test succeeded.</h4>'
      })
    });

    const data = await response.json().catch(() => ({}));
    console.log('[DIAGNOSTIC] Brevo Response Code:', response.status);

    if (response.ok) {
      console.log('[DIAGNOSTIC] SUCCESS! Brevo API key successfully authorized.', data);
    } else {
      console.error('[DIAGNOSTIC] AUTHENTICATION FAILED! Brevo returned:', data);
    }
  } catch (err) {
    console.error('[DIAGNOSTIC] Network connection failed:', err.message);
  }
  process.exit();
};

testApiConnection();
