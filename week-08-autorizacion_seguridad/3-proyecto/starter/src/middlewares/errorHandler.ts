import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Errores esperados de la aplicación (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Errores de validación de Zod → 400 Bad Request
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Datos inválidos',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // CORS rechazado por la whitelist → 403 sin detalles internos
  if (err instanceof Error && err.message.startsWith('CORS blocked:')) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  // Error inesperado: log interno, respuesta genérica (sin stack trace al cliente)
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
