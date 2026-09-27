import { Router } from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/book.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.js';

// ============================================
// RUTAS DE LIBROS — Dominio: Editorial
// ============================================
// Política de acceso (RBAC):
//
//   GET  /        → público        (el catálogo es visible para todos)
//   GET  /:id     → público        (detalle del libro)
//   POST /        → autenticado    (un editor registra libros)
//   PATCH /:id    → autenticado    (el servicio valida dueño o admin)
//   DELETE /:id   → solo admin     (authMiddleware + requireRole('admin'))
//
// IMPORTANTE: requireRole SIEMPRE va DESPUÉS de authMiddleware,
// porque necesita req.user que authMiddleware popula.
// ============================================

const router: Router = Router();

// Catálogo público — la editorial muestra sus libros a cualquier visitante
router.get('/', getBooks);
router.get('/:id', getBookById);

// Crear libro — requiere autenticación
router.post('/', authMiddleware, createBook);

// Actualizar libro — requiere autenticación (dueño o admin, validado en el servicio)
router.patch('/:id', authMiddleware, updateBook);

// Eliminar libro — solo admin
router.delete('/:id', authMiddleware, requireRole('admin'), deleteBook);

export default router;
