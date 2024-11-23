import express from 'express';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();
const isWebContainer = process.env.VITE_WEBCONTAINER === 'true';

// Create magic link
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required'
      });
    }

    if (isWebContainer) {
      // Generate a simple development token
      const token = `dev_${Date.now()}`;
      const magicLink = `${req.protocol}://${req.get('host')}/auth/verify?token=${token}`;
      
      return res.json({ 
        success: true,
        magicLinkSent: true,
        message: 'Magic link created',
        magicLink,
        token
      });
    }

    // In production, would send email here
    res.json({ 
      success: true,
      magicLinkSent: true,
      message: 'Magic link sent successfully'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create magic link'
    });
  }
});

// Rest of the file remains exactly the same
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: 'Token is required'
      });
    }

    // For WebContainer, accept any dev_ token
    if (isWebContainer && token.startsWith('dev_')) {
      return res.json({
        success: true,
        user: {
          id: 'dev-user',
          email: 'dev@example.com',
          displayName: 'Dev User',
          isPro: true
        }
      });
    }

    // In production, would verify token here
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify token'
    });
  }
});

// Check session
router.get('/session', async (req, res) => {
  try {
    // For WebContainer, always return no session
    res.json({
      success: true,
      user: null
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check session'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ 
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;