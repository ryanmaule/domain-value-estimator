import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { addHours } from 'date-fns';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth_token';
const DEV_MODE = process.env.VITE_DEV_MODE === 'true';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function createMagicLink(email) {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  const magicLink = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/auth/verify?token=${token}`;
  
  return magicLink;
}

export async function sendLoginEmail(email, magicLink) {
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

  await transporter.sendMail(mailOptions);
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: addHours(new Date(), 24 * 30) // 30 days
    }
  });

  return token;
}

export async function validateSession(token) {
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: !DEV_MODE,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

// Middleware to check authentication
export async function requireAuth(req, res, next) {
  if (DEV_MODE) {
    req.user = { id: 'debug', email: 'debug@example.com', isPro: true };
    return next();
  }

  const token = req.cookies[COOKIE_NAME];
  const user = await validateSession(token);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = user;
  next();
}

// Debug login for development
export async function debugLogin(email) {
  if (!DEV_MODE) {
    throw new Error('Debug login only available in development mode');
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        isPro: true // Debug users are Pro by default
      }
    });
  }

  const token = await createSession(user.id);
  return { user, token };
}