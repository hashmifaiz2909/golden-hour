import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Middlewares
app.use(cors({
  origin: '*', // Open for local dev and demo devices
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for demo visibility
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/events') {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount Routes
app.use('/api', apiRouter);

// Serve static web app in production if built
const candidateDistDirs = [
  path.resolve(__dirname, '../../../../apps/web/dist'),
  path.resolve(process.cwd(), 'apps/web/dist'),
  path.resolve(process.cwd(), '../apps/web/dist'),
  path.resolve(__dirname, '../../apps/web/dist')
];
const webDistPath = candidateDistDirs.find(d => fs.existsSync(path.join(d, 'index.html')));

if (webDistPath) {
  console.log(`[Web Static] Serving compiled web assets from: ${webDistPath}`);
  app.use(express.static(webDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  // Root fallback
  app.get('/', (req, res) => {
    res.json({
      message: 'Golden Hour Emergency Response Backend API',
      tagline: 'When a victim cannot call for help, technology should speak for them.',
      docs: '/api/health',
      endpoints: {
        auth: '/api/auth/login',
        profile: '/api/profile',
        publicQr: '/api/profile/tag/:tagId',
        alerts: '/api/alerts',
        responder: '/api/responder/alerts',
        events: '/api/events'
      }
    });
  });
}

const server = app.listen(config.port, () => {
  console.log(`\n========================================================`);
  console.log(`🚨 GOLDEN HOUR BACKEND DISPATCH SERVICE STARTED 🚨`);
  console.log(`   Port:         ${config.port}`);
  console.log(`   Environment:  ${config.nodeEnv}`);
  console.log(`   SSE Stream:   http://localhost:${config.port}/api/events`);
  console.log(`   Public QR:    http://localhost:${config.port}/api/profile/tag/:tagId`);
  console.log(`   Responder:    http://localhost:${config.port}/api/responder/alerts`);
  console.log(`========================================================\n`);
});

export default app;
