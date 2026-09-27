import { z } from 'zod';
import { BOOK_GENRES } from '../models/book.model.js';

// ============================================
// SCHEMAS ZOD DEL LIBRO — Dominio: Editorial
// ============================================
// Zod valida Y sanitiza: los regex rechazan HTML en los campos
// de texto, lo que mitiga XSS almacenado (OWASP A03).
// ============================================

const noHtml = (field: string) =>
  z
    .string()
    .regex(/^[^<>]*$/, `${field} must not contain HTML characters`); // prevent XSS

export const createBookSchema = z.object({
  body: z.object({
    title: noHtml('Title')
      .min(2, 'Title must be at least 2 characters')
      .max(200, 'Title must be at most 200 characters'),
    author: noHtml('Author')
      .min(2, 'Author must be at least 2 characters')
      .max(120, 'Author must be at most 120 characters'),
    isbn: z
      .string()
      .trim()
      .regex(/^\d{13}$/, 'ISBN must be exactly 13 digits'),
    genre: z.enum(BOOK_GENRES, {
      error: `Genre must be one of: ${BOOK_GENRES.join(', ')}`,
    }),
    publicationDate: z.coerce.date({
      error: 'publicationDate must be a valid date',
    }),
    price: z
      .number({ error: 'Price must be a number' })
      .nonnegative('Price must be zero or positive'),
    stock: z
      .number({ error: 'Stock must be a number' })
      .int('Stock must be an integer')
      .nonnegative('Stock must be zero or positive')
      .default(0),
  }),
});

export const updateBookSchema = z.object({
  body: z.object({
    title: noHtml('Title').min(2).max(200).optional(),
    author: noHtml('Author').min(2).max(120).optional(),
    isbn: z.string().trim().regex(/^\d{13}$/).optional(),
    genre: z.enum(BOOK_GENRES).optional(),
    publicationDate: z.coerce.date().optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
  }),
});

export type CreateBookDto = z.infer<typeof createBookSchema>['body'];
export type UpdateBookDto = z.infer<typeof updateBookSchema>['body'];
