import { Router } from 'express';
import * as bookController from '../controllers/book.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

// ============================================
// RUTAS DE LIBROS — Dominio: Editorial
// ============================================
// Todas las rutas del catálogo están protegidas:
// solo usuarios autenticados (cookie HttpOnly) pueden operar.
// ============================================

const router: Router = Router();

// Todas las rutas de este router requieren autenticación
router.use(authMiddleware);

// GET /api/v1/books — listar todos los libros
router.get('/', bookController.getAll);

// GET /api/v1/books/:id — obtener un libro por ID
router.get('/:id', bookController.getById);

// POST /api/v1/books — crear un libro
router.post('/', bookController.create);

// PATCH /api/v1/books/:id — actualizar parcialmente
router.patch('/:id', bookController.update);

// DELETE /api/v1/books/:id — eliminar
router.delete('/:id', bookController.remove);

export { router as bookRouter };
