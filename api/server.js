import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const isWebContainer = process.env.VITE_WEBCONTAINER === 'true';
const isProduction = process.env.NODE_ENV === 'production';

// Custom logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Security middleware with relaxed settings for WebContainer
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: isWebContainer ? true : process.env.VITE_APP_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Serve static files in production
if (isProduction) {
  // Serve static files from the dist directory
  app.use(express.static(join(__dirname, '../dist')));

  // Serve index.html for all other routes to support client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: isWebContainer ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  res.status(500).json({ 
    success: false, 
    message: 'Internal server error'
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running in ${isWebContainer ? 'WebContainer' : 'production'} mode on port ${port}`);
});