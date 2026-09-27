import { Schema, model, Document } from 'mongoose';

// ============================================
// MODELO DE LIBRO — Dominio: Editorial
// ============================================
// La editorial gestiona su catálogo de libros.
// `createdBy` guarda el ID del usuario que registró el libro:
// permite que el dueño pueda editar SU libro, mientras que
// solo un admin puede eliminar cualquiera.
// ============================================

export const BOOK_GENRES = [
  'novela',
  'cuento',
  'poesia',
  'ensayo',
  'infantil',
  'academico',
] as const;

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;                    // identificador único de 13 dígitos
  genre: (typeof BOOK_GENRES)[number];
  publicationDate: Date;
  price: number;                   // precio de venta en COP
  stock: number;                   // ejemplares disponibles
  available: boolean;              // derivado de stock (> 0)
  createdBy: string;               // user ID del editor que lo registró
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [1, 'El título no puede estar vacío'],
      maxlength: [200, 'Máximo 200 caracteres'],
    },
    author: {
      type: String,
      required: [true, 'El autor es obligatorio'],
      trim: true,
      minlength: [2, 'Mínimo 2 caracteres'],
      maxlength: [120, 'Máximo 120 caracteres'],
    },
    isbn: {
      type: String,
      required: [true, 'El ISBN es obligatorio'],
      unique: true,
      trim: true,
      match: [/^\d{13}$/, 'El ISBN debe tener exactamente 13 dígitos'],
    },
    genre: {
      type: String,
      enum: BOOK_GENRES,
      required: [true, 'El género es obligatorio'],
    },
    publicationDate: {
      type: Date,
      required: [true, 'La fecha de publicación es obligatoria'],
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    available: {
      type: Boolean,
      default: false,
    },
    createdBy: { type: String, required: true }, // user ID
  },
  { timestamps: true }
);

// Nota: `available` se mantiene sincronizado desde el servicio
// (stock > 0 implica available = true) para no depender de hooks
// de Mongoose cuyo tipado varia entre versiones.

// Modelo del dominio Editorial: Book
export const Book = model<IBook>('Book', bookSchema);
