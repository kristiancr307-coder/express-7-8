import { Request, Response, NextFunction } from 'express';
import * as bookService from '../services/book.service.js';
import { createBookSchema, updateBookSchema } from '../schemas/book.schema.js';
import { AppError } from '../errors/AppError.js';

// ============================================
// CONTROLADOR DE LIBROS — Dominio: Editorial
// ============================================
// Handlers CRUD del catálogo. Valida con Zod, delega al
// servicio y responde con el status HTTP correspondiente.
// ============================================

// GET /api/v1/books — catálogo público
export async function getBooks(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const books = await bookService.findAll();
    res.json({ data: books, total: books.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/books/:id — detalle público (404 si no existe)
export async function getBookById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const book = await bookService.findById(req.params.id);
    if (!book) throw new AppError(404, 'Book not found');
    res.json({ data: book });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/books — crear libro (autenticado)
export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');

    const { body } = createBookSchema.parse({ body: req.body });
    const book = await bookService.create(body, req.user.sub);
    res.status(201).json({ message: 'Book created', data: book });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/books/:id — actualizar (dueño o admin)
export async function updateBook(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');

    const { body } = updateBookSchema.parse({ body: req.body });
    const book = await bookService.update(
      req.params.id,
      body,
      req.user.sub,
      req.user.role as string
    );

    if (!book) throw new AppError(404, 'Book not found');
    res.json({ message: 'Book updated', data: book });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/books/:id — eliminar (solo admin, enforced en la ruta)
export async function deleteBook(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const book = await bookService.remove(req.params.id);
    if (!book) throw new AppError(404, 'Book not found');
    res.json({ message: 'Book deleted', data: { id: book._id } });
  } catch (err) {
    next(err);
  }
}
