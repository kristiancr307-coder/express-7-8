import { BookModel, IBook } from '../models/book.model';
import type { CreateBookDto, UpdateBookDto } from '../schemas/book.schema';

// ============================================
// REPOSITORIO DE LIBROS — Dominio: Editorial
// ============================================
// Capa de acceso a datos: solo consultas de Mongoose,
// sin lógica de negocio (eso va en el service).
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
  return BookModel.find().sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<IBook | null> {
  return BookModel.findById(id);
}

export async function findByIsbn(isbn: string): Promise<IBook | null> {
  return BookModel.findOne({ isbn });
}

export async function create(
  data: CreateBookDto & { createdBy: string }
): Promise<IBook> {
  return BookModel.create(withAvailability(data));
}

export async function updateById(
  id: string,
  data: UpdateBookDto
): Promise<IBook | null> {
  // new: true → devuelve el documento ya actualizado
  // runValidators: true → aplica las validaciones del schema
  return BookModel.findByIdAndUpdate(id, withAvailability(data), {
    new: true,
    runValidators: true,
  });
}

export async function deleteById(id: string): Promise<IBook | null> {
  return BookModel.findByIdAndDelete(id);
}
