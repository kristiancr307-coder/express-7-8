import { Book, IBook } from '../models/book.model.js';
import type { CreateBookDto, UpdateBookDto } from '../schemas/book.schema.js';
import { AppError } from '../errors/AppError.js';

// ============================================
// SERVICIO DE LIBROS — Dominio: Editorial
// ============================================
// Lógica de negocio del catálogo.
// Autorización granular:
//   - crear:      cualquier usuario autenticado
//   - actualizar: el dueño del libro (createdBy) O un admin
//   - eliminar:   solo admin (forzado en la ruta con requireRole)
// ============================================

// `available` es un campo derivado: se sincroniza con el stock
// antes de escribir para que el catálogo siempre sea coherente.
function withAvailability<T extends { stock?: number; available?: boolean }>(data: T): T {
  if (typeof data.stock === 'number') {
    return { ...data, available: data.stock > 0 };
  }
  return data;
}

export async function findAll(): Promise<IBook[]> {
  return Book.find().sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<IBook | null> {
  return Book.findById(id);
}

export async function create(data: CreateBookDto, userId: string): Promise<IBook> {
  // El ISBN es único en el catálogo de la editorial.
  const existing = await Book.findOne({ isbn: data.isbn });
  if (existing) {
    throw new AppError(409, `ISBN ${data.isbn} already exists`);
  }
  return Book.create(withAvailability({ ...data, createdBy: userId }));
}

export async function update(
  id: string,
  data: UpdateBookDto,
  requesterId: string,
  requesterRole: string
): Promise<IBook | null> {
  const book = await Book.findById(id);
  if (!book) return null;

  // Autorización: solo el dueño o un admin pueden editar.
  if (requesterRole !== 'admin' && book.createdBy !== requesterId) {
    throw new AppError(403, 'You can only update books you created');
  }

  // Si se cambia el ISBN, validar que no choque con otro libro.
  if (data.isbn && data.isbn !== book.isbn) {
    const duplicated = await Book.findOne({ isbn: data.isbn });
    if (duplicated) {
      throw new AppError(409, `ISBN ${data.isbn} already exists`);
    }
  }

  return Book.findByIdAndUpdate(id, withAvailability(data), {
    new: true,
    runValidators: true,
  });
}

export async function remove(id: string): Promise<IBook | null> {
  // Eliminación reservada a admin — enforced en la ruta con requireRole('admin').
  return Book.findByIdAndDelete(id);
}
