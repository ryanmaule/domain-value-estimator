import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth_token';
const DEV_MODE = process.env.VITE_DEV_MODE === 'true';

// In-memory store for dev mode
const devUsers = new Map();

// Email configuration (only used in production)
const transporter = DEV_MODE ? null : nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function createMagicLink(email) {
  console.log('Creating magic link for:', email);
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
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
    from: process.env.SMTP_FROM || 'noreply@domainestimator.com',
    to: email,
    subject: 'Login to Domain Value Estimator',
    html: `
      <h1>Welcome to Domain Value Estimator</h1>
      <p>Click the button below to log in:</p>
      <a href="${magicLink}" style="display:inline-block;background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">
        Log In
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this login link, please ignore this email.</p>
    `
  };

  try {
    await transporter?.sendMail(mailOptions);
    console.log('Login email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send login email:', {
      error: error.message,
      stack: error.stack,
      email
    });
    throw error;
  }
}

export async function verifyToken(token) {
  console.log('Verifying token');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', {
      error: error.message,
      stack: error.stack
    });
    return null;
  }
}

export async function createSession(email) {
  console.log('Creating session for:', email);
  // In dev mode, create a session token with the email
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
      // In dev mode, always return a pro user
      return {
        id: 'dev-user',
        email: decoded.email,
        isPro: true
      };
    }

    console.log('Production mode: No validation implemented');
    // Production validation would go here
    return null;
  } catch (error) {
    console.error('Session validation error:', {
      error: error.message,
      stack: error.stack
    });
    return null;
  }
}

export function setAuthCookie(res, token) {
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
    secure: !DEV_MODE, // Only require HTTPS in production
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  console.log('Auth cookie set successfully');
}

export function clearAuthCookie(res) {
  console.log('Clearing auth cookie');
  res.clearCookie(COOKIE_NAME);
  console.log('Auth cookie cleared successfully');
}

// Middleware to check authentication
export async function requireAuth(req, res, next) {
  console.log('Checking authentication');
  
  if (DEV_MODE) {
    console.log('Dev mode: Providing pro user');
    // In dev mode, always provide a pro user
    req.user = { 
      id: 'dev-user',
      email: 'dev@example.com',
      isPro: true 
    };
    return next();
  }

  console.log('Found auth token:', !!token);
  
  const token = req.cookies[COOKIE_NAME];
  const user = await validateSession(token);
  console.log('Validation result:', user);

  if (!user) {
    console.log('Authentication failed: No valid user');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('Authentication successful:', user);
  req.user = user;
  next();
}

// Debug login for development
export async function debugLogin(email) {
  console.log('Attempting debug login:', { email, devMode: DEV_MODE });
  
  if (!DEV_MODE) {
    console.error('Debug login attempted in production mode');
    throw new Error('Debug login only available in development mode');
  }

  // Create a dev user with Pro status
  const user = {
    id: 'dev-user',
    email,
    isPro: true
  };
  console.log('Dev user created:', user);

  // Store in memory for dev mode
  devUsers.set(email, user);
  
  // Create a session token
  const token = await createSession(email);
  
  console.log('Debug login successful:', { user, token });
  return { user, token };
}