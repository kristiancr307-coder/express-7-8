import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import { bookRouter } from './routes/book.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export const app: express.Express = express();

app.use(express.json());
app.use(cookieParser());

// Rutas de autenticación
app.use('/api/v1/auth', authRouter);

// Catálogo de la editorial — dominio: Libros
app.use('/api/v1/books', bookRouter);

// Health check público (útil para verificar que la API está viva)
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middlewares de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);
