# 🛡️ Proyecto Semana 08: API Segura de Editorial con RBAC y Capas de Seguridad

## 🎯 Dominio Asignado: **Editorial**

Recurso principal: **Libro**. La editorial gestiona su catálogo
(título, autor, ISBN único, género, fecha de publicación, precio y stock).
Cada libro registra qué usuario lo creó (`createdBy`), lo que permite
aplicar autorización granular: el dueño puede editar su libro, y solo un
admin puede eliminar cualquiera.

---

## 👥 Roles y permisos

| Rol | Puede hacer |
|-----|-------------|
| **Público** (sin token) | Ver el catálogo (`GET /books`, `GET /books/:id`) |
| **user** (autenticado) | Todo lo público + crear libros + editar **sus** libros |
| **admin** (autenticado) | Todo lo anterior + editar **cualquier** libro + eliminar libros + `GET /admin/*` |

| Ruta | Público | user | admin |
|------|:------:|:----:|:-----:|
| `GET /api/v1/books` | ✅ | ✅ | ✅ |
| `GET /api/v1/books/:id` | ✅ | ✅ | ✅ |
| `POST /api/v1/books` | ❌ 401 | ✅ | ✅ |
| `PATCH /api/v1/books/:id` | ❌ 401 | ✅ solo dueño | ✅ |
| `DELETE /api/v1/books/:id` | ❌ 401 | ❌ 403 | ✅ |
| `GET /api/v1/users/dashboard` | ❌ 401 | ✅ | ✅ |

---

## 📡 Endpoints

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/v1/health` | Público | Health check |
| POST | `/api/v1/auth/register` | Público (+ rate limit 5/15min) | Registro |
| POST | `/api/v1/auth/login` | Público (+ rate limit 5/15min) | Login → `accessToken` (body) + cookie `refreshToken` |
| POST | `/api/v1/auth/refresh` | Cookie refresh | Renueva el access token |
| POST | `/api/v1/auth/logout` | 🔒 Auth | Cierra sesión |
| GET | `/api/v1/auth/me` | 🔒 Auth | Perfil del usuario |
| GET | `/api/v1/users/dashboard` | 🔒 Auth | Dashboard (cualquier rol) |
| GET | `/api/v1/books` | Público | Catálogo de la editorial |
| GET | `/api/v1/books/:id` | Público | Detalle de un libro |
| POST | `/api/v1/books` | 🔒 Auth | Crear libro |
| PATCH | `/api/v1/books/:id` | 🔒 Auth (dueño o admin) | Actualizar libro |
| DELETE | `/api/v1/books/:id` | 🔒 Auth + `requireRole('admin')` | Eliminar libro |

---

## 🛡️ Capas de seguridad aplicadas

| Capa | Herramienta | Detalle |
|------|-------------|---------|
| Headers HTTP | **Helmet** | CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, etc. |
| Rate limiting global | **express-rate-limit** | 100 req / 15 min por IP en toda la API (`globalLimiter`) |
| Rate limiting auth | **express-rate-limit** | 5 req / 15 min por IP en `/login` y `/register` (anti fuerza bruta) |
| CORS | **cors** con whitelist | Solo orígenes explícitos (`ALLOWED_ORIGINS`), `credentials: true`, nunca `cors()` a secas |
| Sanitización | **express-mongo-sanitize** | Elimina operadores MongoDB (`$gt`, `$where`, …) → mitiga **NoSQL injection** |
| Anti-XSS | **Zod** | Los regex rechazan `<` y `>` en campos de texto |
| RBAC | `requireRole()` | 401 sin token, 403 con token pero sin el rol requerido |
| Errores seguros | `errorHandler` | Sin stack traces al cliente; Zod → 400; AppError → su status |

### Diferencia autenticación vs autorización

- **Autenticación** (`authMiddleware`): ¿quién eres? Verifica el JWT y popula `req.user`.
- **Autorización** (`requireRole`): ¿qué puedes hacer? Verifica `req.user.role` contra los roles permitidos.

---

## ⚠️ Notas de compatibilidad (Express 5)

Este proyecto usa **Express 5.1.0**, que rompe dos comportamientos de versiones antiguas:

1. **`express-mongo-sanitize` 2.2.0** — su middleware reasigna `req.query`/`req.headers`,
   que en Express 5 son *getters* de solo lectura → cada request moría con 500.
   **Solución aplicada** (`src/app.ts`): usar su función `mongoSanitize.sanitize()`,
   que muta los objetos in-place, sin reasignar. La sanitización sigue siendo completa
   (body, params y query).

2. **`express-rate-limit` 7.5** — envía el formato combinado del estándar draft-7:
   ```
   RateLimit-Policy: 100;w=900
   RateLimit: limit=100, remaining=99, reset=900
   ```
   (versiones antiguas enviaban `RateLimit-Limit` y `RateLimit-Remaining` por separado).

---

## ▶️ Cómo ejecutar

```bash
cd starter
pnpm install
cp .env.example .env
docker compose up -d      # MongoDB
pnpm dev
```

El servidor crea automáticamente dos usuarios de prueba al arrancar (seed integrado):

| Email | Password | Rol |
|-------|----------|-----|
| `user@test.com` | `User1234!` | user |
| `admin@test.com` | `Admin1234!` | admin |

---

## 🧪 Flujo de prueba

```bash
# 1. Login como user → guarda accessToken (body) + cookie refreshToken
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@test.com","password":"User1234!"}'

# 2. Catálogo público (sin token)
curl http://localhost:3000/api/v1/books

# 3. Crear libro (con token)
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Rayuela","author":"Julio Cortázar","isbn":"9788420478836",
       "genre":"novela","publicationDate":"1963-06-28","price":78000,"stock":10}'

# 4. Editar un libro de OTRO usuario con rol user → 403 Forbidden
# 5. Eliminar con token de user → 403; con token de admin → 200

# 6. Verificar headers de seguridad
curl -I http://localhost:3000/api/v1/health
#   X-Content-Type-Options: nosniff
#   RateLimit-Limit: 100 / RateLimit-Remaining: 99

# 7. NoSQL injection (no bypassea el login)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}'
#   → 400/401, nunca 200

# 8. Rate limiting: el 6º login seguido → 429 Too Many Requests
```

---

## 🗂️ Estructura

```
starter/
├── src/
│   ├── app.ts                     # helmet + rate limits + CORS + sanitize + rutas
│   ├── server.ts                  # connectDB + seed de usuarios + listen
│   ├── config/security.ts         # globalLimiter, authLimiter, corsOptions
│   ├── lib/mongoose.ts
│   ├── errors/AppError.ts
│   ├── types/express.d.ts
│   ├── utils/jwt.ts               # access + refresh tokens
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # verifica Bearer token → req.user
│   │   ├── requireRole.ts         # RBAC: 401 sin user, 403 sin rol
│   │   ├── errorHandler.ts        # AppError/Zod/CORS → status correctos
│   │   └── notFound.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   └── book.schema.ts         # Zod + anti-XSS + anti-NoSQL
│   ├── models/
│   │   ├── user.model.ts          # role: 'user' | 'admin'
│   │   └── book.model.ts          # catálogo editorial + createdBy
│   ├── repositories/users.repository.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── book.service.ts        # create/update con reglas de dueño-o-admin
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── book.controller.ts
│   └── routes/
│       ├── auth.routes.ts         # login/register con authLimiter
│       ├── user.routes.ts
│       └── book.routes.ts         # RBAC por ruta
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## ✅ Checklist de criterios de evaluación

- [x] `authMiddleware` en todas las rutas privadas (401 sin token válido)
- [x] `requireRole('admin')` en rutas administrativas (403 con rol incorrecto)
- [x] Helmet aplicado — headers de seguridad visibles
- [x] CORS con whitelist (nunca `*`)
- [x] Rate limiting en auth (5/15min → 429) y global (100/15min)
- [x] `express-mongo-sanitize` aplicado (NoSQL injection mitigada)
- [x] Sin secretos en código — todo en `.env`
- [x] Errores sin stack traces expuestos
- [x] CRUD del recurso con RBAC (lectura pública, escritura restringida)
- [x] Código adaptado al dominio (nombres reales: `Book`, `book.routes.ts`…)
