import nodemailer from 'nodemailer';

const DEV_MODE = process.env.VITE_DEV_MODE === 'true';
const transporter = DEV_MODE ? null : nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendPaymentFailedEmail(email, { amount, currency, nextAttempt }) {
  if (DEV_MODE) {
    console.log('Dev mode: Skipping payment failed email');
    return;
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);

  const nextAttemptDate = nextAttempt 
    ? new Date(nextAttempt * 1000).toLocaleDateString()
    : 'soon';

  const mailOptions = {
    from: {
      name: 'Domain Value',
      address: process.env.SMTP_FROM || 'noreply@domainvalue.dev'
    },
    to: email,
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #4f46e5; padding: 24px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                        Payment Failed
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 24px;">
                      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                        We were unable to process your payment of ${formattedAmount} for your Domain Value Pro subscription.
                      </p>
                      
                      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                        We'll try again on ${nextAttemptDate}. To ensure uninterrupted service, please:
                      </p>
                      
                      <ol style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                        <li>Check your payment method's expiration date</li>
                        <li>Verify you have sufficient funds available</li>
                        <li>Update your payment information if needed</li>
                      </ol>
                      
                      <div style="text-align: center;">
                        <a href="${process.env.VITE_APP_URL}/account" 
                           style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
                          Update Payment Method
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        © ${new Date().getFullYear()} Domain Value. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };

  try {
    await transporter?.sendMail(mailOptions);
    console.log('Payment failed email sent to:', email);
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    throw error;
  }
}