import { z } from 'zod';
import { BOOK_GENRES } from '../models/book.model';

// ============================================
// SCHEMAS ZOD DEL LIBRO — Dominio: Editorial
// ============================================
// Zod valida y sanitiza los datos de entrada antes de
// que lleguen a la base de datos (primera defensa contra
// inyección y datos basura).
// ============================================

export const createBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio')
    .max(200, 'Máximo 200 caracteres'),
  author: z
    .string()
    .trim()
    .min(2, 'El autor debe tener al menos 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  isbn: z
    .string()
    .trim()
    .regex(/^\d{13}$/, 'El ISBN debe tener exactamente 13 dígitos'),
  genre: z.enum(BOOK_GENRES, {
    error: `El género debe ser uno de: ${BOOK_GENRES.join(', ')}`,
  }),
  publicationDate: z.coerce.date({
    error: 'La fecha de publicación no es válida',
  }),
  price: z
    .number({ error: 'El precio debe ser un número' })
    .nonnegative('El precio no puede ser negativo'),
  stock: z
    .number({ error: 'El stock debe ser un número' })
    .int('El stock debe ser un número entero')
    .nonnegative('El stock no puede ser negativo')
    .default(0),
});

// Actualización parcial: todos los campos son opcionales.
export const updateBookSchema = createBookSchema.partial();

export type CreateBookDto = z.infer<typeof createBookSchema>;
export type UpdateBookDto = z.infer<typeof updateBookSchema>;
