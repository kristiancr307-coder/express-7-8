# 🚀 Proyecto Semanal: API de Editorial con Autenticación JWT Completa

## 🎯 Dominio Asignado: **Editorial**

El recurso principal del dominio es el **Libro**: la editorial gestiona su catálogo
(título, autor, ISBN, género, fecha de publicación, precio y stock), y cada libro
queda asociado al usuario que lo registró (`createdBy`).

---

## 📋 Descripción

API REST con autenticación completa:

- **bcrypt** para el hash de contraseñas (salt rounds = 10)
- **JWT** access token (15 min) + refresh token (7 días) con **secretos distintos**
- Tokens en **cookies HttpOnly** (nunca en `localStorage`)
- **Rotación de refresh tokens**: cada `/auth/refresh` invalida el anterior
- **Logout** que borra el hash del refresh token en la base de datos y limpia las cookies
- Rutas del catálogo protegidas con `authMiddleware`

---

## 🔐 Endpoints

### Autenticación

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/v1/auth/register` | Público | Registro con contraseña hasheada |
| POST | `/api/v1/auth/login` | Público | Login → cookies `accessToken` + `refreshToken` |
| GET | `/api/v1/auth/me` | 🔒 Auth | Perfil del usuario autenticado |
| POST | `/api/v1/auth/refresh` | Cookie refresh | Renueva ambos tokens (rotación) |
| POST | `/api/v1/auth/logout` | 🔒 Auth | Invalida el refresh token y limpia cookies |

### Catálogo (Libros) — todas protegidas con `authMiddleware`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/books` | Listar todos los libros |
| GET | `/api/v1/books/:id` | Detalle de un libro (404 si no existe) |
| POST | `/api/v1/books` | Crear libro (201) |
| PATCH | `/api/v1/books/:id` | Actualización parcial |
| DELETE | `/api/v1/books/:id` | Eliminar (204) |

---

## 🗂️ Estructura

```
starter/
├── src/
│   ├── app.ts                        # monta auth + books + health
│   ├── server.ts                     # connectDB + listen + graceful shutdown
│   ├── lib/mongoose.ts               # connectDB / disconnectDB
│   ├── errors/AppError.ts            # error con statusCode
│   ├── types/express.d.ts            # req.user tipado globalmente
│   ├── utils/jwt.ts                  # sign/verify access + refresh
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # verifica JWT de la cookie
│   │   ├── errorHandler.ts           # AppError → status, ZodError → 400
│   │   └── notFound.ts
│   ├── schemas/
│   │   ├── auth.schema.ts            # register/login (Zod)
│   │   └── book.schema.ts            # createBook / updateBook (Zod)
│   ├── models/
│   │   ├── user.model.ts             # email, password (select: false), role, refreshToken
│   │   └── book.model.ts             # título, autor, ISBN único, género, precio, stock
│   ├── repositories/
│   │   ├── users.repository.ts
│   │   └── book.repository.ts
│   ├── services/
│   │   ├── auth.service.ts           # register/login/refresh/logout/getMe
│   │   └── book.service.ts           # lógica de negocio del catálogo
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── book.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── book.routes.ts            # CRUD protegido con authMiddleware
│   └── scripts/seed.ts               # usuarios de prueba (admin/editor)
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## ▶️ Cómo ejecutar

```bash
cd starter

# 1. Dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
# Genera secretos distintos: openssl rand -base64 64
#   JWT_ACCESS_SECRET=...
#   JWT_REFRESH_SECRET=...

# 3. MongoDB
docker compose up -d

# 4. (Opcional) usuarios de prueba
pnpm seed
#   admin@editorial.com  / Admin1234!   (role: admin)
#   editor@editorial.com / Editor1234!  (role: user)

# 5. Servidor
pnpm dev
```

---

## 🧪 Flujo de prueba (Thunder Client / Postman)

1. **Register** — `POST /api/v1/auth/register`
   ```json
   { "email": "test@test.com", "password": "Test1234!", "name": "Test User" }
   ```
   → `201 { id, email, name, role }`

2. **Login** — `POST /api/v1/auth/login` con las mismas credenciales
   → `200` + cookies `accessToken` (HttpOnly) y `refreshToken` (HttpOnly)

3. **Ruta protegida** — `GET /api/v1/auth/me` (con la cookie) → `200` con el perfil
   Sin cookie → `401`

4. **CRUD de libros** (con cookie activa):
   ```bash
   POST   /api/v1/books      { "title": "Cien años de soledad", "author": "Gabriel García Márquez",
                               "isbn": "9780307474728", "genre": "novela",
                               "publicationDate": "1967-05-30", "price": 89000, "stock": 25 }
   GET    /api/v1/books      → lista + total
   GET    /api/v1/books/:id  → detalle (404 si no existe)
   PATCH  /api/v1/books/:id  { "price": 95000 }
   DELETE /api/v1/books/:id  → 204
   ```

5. **Refresh** — `POST /api/v1/auth/refresh` (con cookie refreshToken)
   → `200` con nuevas cookies; el refresh token anterior queda invalidado

6. **Logout** — `POST /api/v1/auth/logout` → `200`, cookies eliminadas.
   Un `/auth/refresh` posterior → `401`

---

## 🔐 Criterios de seguridad cumplidos

| Criterio | Implementación |
|----------|----------------|
| Contraseñas hasheadas | `bcrypt.hash(password, 10)` en el registro |
| Secrets distintos | `JWT_ACCESS_SECRET` ≠ `JWT_REFRESH_SECRET` (solo en `.env`) |
| Cookies HttpOnly | `httpOnly: true`, `sameSite: 'lax'`, `secure` en producción |
| Refresh token hasheado en DB | Solo se guarda el hash bcrypt del refresh token |
| Rotación de refresh token | Cada `/auth/refresh` genera tokens nuevos e invalida el anterior |
| Rutas protegidas | Todo el CRUD de libros usa `authMiddleware` |
| Anti user-enumeration | Mismo mensaje (`Credenciales inválidas`) para email inexistente y contraseña incorrecta |
| Validación de entrada | Zod en todos los bodies (`book.schema.ts`) |

### Nota de seguridad conocida: bcrypt trunca a 72 bytes

bcrypt (y bcryptjs) solo usan los **primeros 72 bytes** de la entrada. Como los JWT
son más largos, dos refresh tokens del mismo usuario firmados con `iat` en el mismo
segundo producirían hashes equivalentes. En la práctica los tokens se emiten en
momentos distintos, pero es un matiz importante del patrón "guardar el hash del
refresh token": la invalidación real y determinista ocurre en el **logout**
(`refreshToken = null` en DB) y al rotar con tokens que difieren en los primeros
72 bytes.

---

## 🔗 Navegación

← Semana 06: MongoDB + Mongoose | Semana 08: Autorización y Seguridad →
