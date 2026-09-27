import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import bookRoutes from './routes/book.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { globalLimiter, corsOptions } from './config/security.js';

const app: express.Express = express();

// ── Capas de seguridad (el orden importa) ────────────────────────────────────
app.use(helmet());          // 12 headers de seguridad HTTP
app.use(globalLimiter);     // 100 req / 15 min por IP (toda la API)

// CORS con whitelist + preflight
app.options('/*splat', cors(corsOptions)); // handle preflight for all routes
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitización DESPUÉS del parseo y ANTES de las rutas:
// elimina operadores MongoDB ($gt, $where, …) de body, query y params.
// Nota: express-mongo-sanitize 2.2.0 no es compatible con Express 5 —
// su middleware intenta reasignar req.query/req.headers, que en Express 5
// son getters de solo lectura (TypeError → 500 en cada request).
// Workaround: usar su función sanitize(), que muta los objetos in-place.
app.use((req, _res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  mongoSanitize.sanitize(req.query);
  next();
});

// Health check — ruta pública sin auth
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Catálogo de la editorial — dominio: Libros
app.use('/api/v1/books', bookRoutes);

// Error handling (always last)
app.use(notFound);
app.use(errorHandler);

export { app };
