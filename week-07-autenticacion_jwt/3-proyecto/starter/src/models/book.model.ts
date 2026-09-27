import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// MODELO DE LIBRO — Dominio: Editorial
// ============================================
// Una editorial publica y gestiona su catálogo de libros.
// Cada libro queda asociado al usuario (editor) que lo dio de alta
// mediante `createdBy`, lo que permite auditar quién cargó cada título.
// ============================================

export const BOOK_GENRES = [
  'novela',
  'cuento',
  'poesia',
  'ensayo',
  'infantil',
  'academico',
] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;                    // identificador único de 13 dígitos
  genre: BookGenre;
  publicationDate: Date;
  price: number;                   // precio de venta en COP
  stock: number;                   // ejemplares disponibles en bodega
  available: boolean;              // true si stock > 0 (campo sincronizado)
  createdBy: mongoose.Types.ObjectId; // usuario que registró el libro
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El libro debe registrar quién lo creó'],
    },
  },
  { timestamps: true }
);

// Nota: `available` se mantiene sincronizado desde el repositorio
// (stock > 0 implica available = true) para no depender de hooks
// de Mongoose cuyo tipado varia entre versiones.

export const BookModel = mongoose.model<IBook>('Book', bookSchema);
