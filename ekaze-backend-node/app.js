const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const securityMiddleware = require('./middleware/security');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// 1. Trust Proxy (for accurate IP tracking behind reverse proxies / Load Balancers)
app.set('trust proxy', 1);

// 2. CORS Policy
const allowedOrigins = [
  env.FRONTEND_URL,
  'https://ekaze.benofinance.rw',
  'http://ekaze.benofinance.rw',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman/curl) or from any allowed local origin or dev mode
    if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Language', 'x-language', 'Accept-Language']
};
app.use(cors(corsOptions));

// 3. Security Headers & Parameter Sanitization
app.use(securityMiddleware);

// 4. Rate Limiting
app.use('/api/', globalRateLimiter);

// 5. Body Parsing
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(cookieParser(env.SESSION_SECRET));

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Health Route at root
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Public Worker Card Verification Webhook & Page
const { verifyWorkerCardPublic, viewWorkerEmploymentContractHtml } = require('./controllers/workerController');
app.get('/verify/:id', verifyWorkerCardPublic);
app.get('/verify-card/:id', verifyWorkerCardPublic);
app.get('/contract/:id', viewWorkerEmploymentContractHtml);
app.get('/contracts/:id', viewWorkerEmploymentContractHtml);

// USSD Gateway root webhook alias
const ussdRoutes = require('./ussd/ussdRoutes');
app.use('/ussd', ussdRoutes);

// 7. Real-Time Audit & Navigation Middleware
const auditNavigationMiddleware = require('./middleware/auditMiddleware');
app.use(auditNavigationMiddleware);

// 8. API Routes mounted under /api/v1
app.use('/api/v1', apiRoutes);

// 8. Catch-all for non-API unmapped routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// 9. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
