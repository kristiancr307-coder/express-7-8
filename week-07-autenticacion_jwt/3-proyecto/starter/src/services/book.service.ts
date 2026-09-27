import { IBook } from '../models/book.model';
import * as bookRepository from '../repositories/book.repository';
import type { CreateBookDto, UpdateBookDto } from '../schemas/book.schema';
import { AppError } from '../errors/AppError';

// ============================================
// SERVICIO DE LIBROS — Dominio: Editorial
// ============================================
// Lógica de negocio del catálogo: validaciones de dominio
// (ISBN único, existencia del libro) orquestando el repositorio.
// ============================================

export async function getAll(): Promise<IBook[]> {
  return bookRepository.findAll();
}

export async function getById(id: string): Promise<IBook> {
  const book = await bookRepository.findById(id);
  if (!book) {
    throw new AppError(404, 'Libro no encontrado');
  }
  return book;
}

export async function create(
  dto: CreateBookDto,
  userId: string
): Promise<IBook> {
  // Regla de negocio: el ISBN es único en el catálogo de la editorial.
  const existing = await bookRepository.findByIsbn(dto.isbn);
  if (existing) {
    throw new AppError(409, `El ISBN ${dto.isbn} ya está registrado`);
  }

  return bookRepository.create({ ...dto, createdBy: userId });
}

export async function update(
  id: string,
  dto: UpdateBookDto
): Promise<IBook> {
  const book = await getById(id); // lanza 404 si no existe

  // Si se intenta cambiar el ISBN, validar que no choque con otro libro.
  if (dto.isbn && dto.isbn !== book.isbn) {
    const duplicated = await bookRepository.findByIsbn(dto.isbn);
    if (duplicated) {
      throw new AppError(409, `El ISBN ${dto.isbn} ya está registrado`);
    }
  }

  const updated = await bookRepository.updateById(id, dto);
  if (!updated) {
    throw new AppError(404, 'Libro no encontrado');
  }
  return updated;
}

export async function remove(id: string): Promise<void> {
  const deleted = await bookRepository.deleteById(id);
  if (!deleted) {
    throw new AppError(404, 'Libro no encontrado');
  }
}
