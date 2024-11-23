import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3001;
const isWebContainer = process.env.VITE_WEBCONTAINER === 'true';

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