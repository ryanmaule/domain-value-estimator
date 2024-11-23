import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth_token';
const DEV_MODE = process.env.VITE_DEV_MODE === 'true';

// Token blacklist with cleanup
const tokenBlacklist = new Map();

// Cleanup expired blacklist entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, timestamp] of tokenBlacklist.entries()) {
    if (now - timestamp > 3600000) { // Remove after 1 hour
      tokenBlacklist.delete(token);
    }
  }
}, 3600000); // Run every hour

// Email configuration
const transporter = DEV_MODE ? null : nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function createMagicLink(email) {
  console.log('Creating magic link for:', email);
  
  // Invalidate any existing tokens for this email
  for (const [token, data] of tokenBlacklist.entries()) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.email === email) {
        // Keep the token in blacklist but update timestamp
        tokenBlacklist.set(token, Date.now());
      }
    } catch (error) {
      console.error('Error decoding token during cleanup:', error);
    }
  }

  const token = jwt.sign({ email, nonce: Date.now() }, JWT_SECRET, { expiresIn: '1h' });
  const magicLink = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/auth/verify?token=${token}`;
  console.log('Magic link created:', { email, magicLink });
  return magicLink;
}

export async function sendLoginEmail(email, magicLink) {
  console.log('Attempting to send login email:', { email, devMode: DEV_MODE });
  
  if (DEV_MODE) {
    console.log('Dev mode: Skipping email send');
    return;
  }

  const mailOptions = {
    from: {
      name: 'Domain Value Estimator',
      address: process.env.SMTP_FROM || 'noreply@domainvalue.dev'
    },
    to: email,
    subject: 'Login to Domain Value Estimator',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login to Domain Value Estimator</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #4f46e5; padding: 24px; text-align: center;">
                      <img src="${process.env.VITE_APP_URL}/favicon.svg" alt="Logo" style="width: 48px; height: 48px;">
                      <h1 style="color: #ffffff; margin: 12px 0 0 0; font-size: 24px; font-weight: 600;">
                        Domain Value Estimator
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 24px;">
                      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">
                        Welcome Back!
                      </h2>
                      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                        Click the button below to securely log in to your Domain Value Estimator account. This link will expire in 1 hour for security purposes.
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 16px 0;">
                            <a href="${magicLink}" 
                               style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                              Log In
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Backup Link -->
                      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                        If the button doesn't work, copy and paste this link into your browser:
                        <br>
                        <a href="${magicLink}" style="color: #4f46e5; text-decoration: none; word-break: break-all;">
                          ${magicLink}
                        </a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">
                        Didn't request this email? You can safely ignore it.
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        © ${new Date().getFullYear()} Domain Value Estimator. All rights reserved.
                        <br>
                        123 Valuation Street, Suite 100, San Francisco, CA 94105
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
    console.log('Login email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send login email:', error);
    throw error;
  }
}

export async function verifyToken(token) {
  console.log('Verifying token');
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      console.log('Token is blacklisted');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', decoded);

    // Add used token to blacklist
    tokenBlacklist.set(token, Date.now());

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function createSession(email) {
  console.log('Creating session for:', email);
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '30d' });
  console.log('Session created:', { email, token });
  return token;
}

export async function validateSession(token) {
  console.log('Validating session token');
  if (!token) {
    console.log('No token provided');
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    if (DEV_MODE) {
      console.log('Dev mode: Returning pro user');
      return {
        id: 'dev-user',
        email: decoded.email,
        isPro: true
      };
    }

    // Here you would typically validate against your database
    // and return the user's full profile
    return {
      id: decoded.email,
      email: decoded.email,
      displayName: decoded.email.split('@')[0],
      isPro: true // This should be based on subscription status
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function debugLogin(email) {
  console.log('Attempting debug login:', { email, devMode: DEV_MODE });
  
  if (!DEV_MODE) {
    console.error('Debug login attempted in production mode');
    throw new Error('Debug login only available in development mode');
  }

  const user = {
    id: 'dev-user',
    email,
    isPro: true
  };

  console.log('Dev user created:', user);
  devUsers.set(email, user);
  
  return { user };
}

export function setAuthCookie(res, token) {
  if (DEV_MODE) {
    console.log('Dev mode: Skipping cookie setting');
    return;
  }

  console.log('Setting auth cookie with options:', {
    token: token ? 'present' : 'missing',
    cookieName: COOKIE_NAME,
    secure: !DEV_MODE,
    devMode: DEV_MODE,
    responseObject: res ? 'present' : 'missing'
  });

  if (!res || !token) {
    console.error('Missing required parameters for setAuthCookie');
    return;
  }

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: !DEV_MODE,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  console.log('Auth cookie set successfully');
}

export function clearAuthCookie(res) {
  if (DEV_MODE) {
    console.log('Dev mode: Skipping cookie clearing');
    return;
  }

  console.log('Clearing auth cookie');
  res.clearCookie(COOKIE_NAME);
  console.log('Auth cookie cleared successfully');
}

export async function requireAuth(req, res, next) {
  console.log('Checking authentication');
  
  if (DEV_MODE) {
    console.log('Dev mode: Providing pro user');
    req.user = { 
      id: 'dev-user',
      email: 'dev@example.com',
      isPro: true 
    };
    return next();
  }

  const token = req.cookies[COOKIE_NAME];
  console.log('Found auth token:', !!token);
  
  const user = await validateSession(token);
  console.log('Validation result:', user);

  if (!user) {
    console.log('Authentication failed: No valid user');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = user;
  console.log('Authentication successful:', user);
  next();
}