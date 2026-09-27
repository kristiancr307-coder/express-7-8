import { Request, Response, NextFunction } from 'express';
import * as bookService from '../services/book.service';
import { createBookSchema, updateBookSchema } from '../schemas/book.schema';
import { AppError } from '../errors/AppError';

// ============================================
// CONTROLADOR DE LIBROS — Dominio: Editorial
// ============================================
// Conecta la capa HTTP con el servicio: valida con Zod,
// delega la lógica de negocio y define el status HTTP.
// ============================================

// GET /api/v1/books — listar el catálogo
export async function getAll(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const books = await bookService.getAll();
    res.status(200).json({ data: books, total: books.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/books/:id — detalle de un libro (404 si no existe)
export async function getById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const book = await bookService.getById(req.params.id);
    res.status(200).json({ data: book });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/books — crear un libro (201)
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'No autenticado');
    }
    const dto = createBookSchema.parse(req.body);
    const book = await bookService.create(dto, req.user.sub);
    res.status(201).json({ data: book });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/books/:id — actualización parcial
export async function update(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dto = updateBookSchema.parse(req.body);
    const book = await bookService.update(req.params.id, dto);
    res.status(200).json({ data: book });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/books/:id — eliminar (204, sin body)
export async function remove(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await bookService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
