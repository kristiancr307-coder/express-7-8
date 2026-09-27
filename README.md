# express-7-8 — Bootcamp Express.js: Semanas 07 y 08

Entregables del bootcamp de Express.js correspondientes a la **semana 07**
(Autenticación con JWT) y la **semana 08** (Autorización y Seguridad), basados en
las especificaciones del repositorio del instructor
([ergrato-dev/bc-expressjs](https://github.com/ergrato-dev/bc-expressjs/tree/main/bootcamp)).

**Dominio asignado: Editorial** — el recurso principal de ambos proyectos es el **Libro**
(título, autor, ISBN único, género, fecha de publicación, precio y stock).

## Estructura

```
week-07-autenticacion_jwt/
└── 3-proyecto/               # API de Editorial con autenticación JWT completa
    ├── README.md             # dominio, endpoints, flujos de prueba
    └── starter/              # bcrypt + JWT access/refresh + cookies HttpOnly

week-08-autorizacion_seguridad/
└── 3-proyecto/               # API segura con RBAC y capas de seguridad
    ├── README.md             # roles/permisos, capas de seguridad, pruebas
    └── starter/              # Helmet + CORS whitelist + rate limiting + sanitización
```

Cada semana es un commit independiente sobre la rama del ejercicio.

## Semana 07 — Autenticación con JWT

- Registro con contraseña hasheada (bcrypt, 10 salt rounds)
- Login que emite **access token (15 min)** y **refresh token (7 días)** en cookies HttpOnly
- Rotación de refresh tokens y logout que invalida el token en DB
- CRUD de libros protegido con `authMiddleware`
- Validación con Zod, ISBN único, errores 400/401/404/409

```bash
cd week-07-autenticacion_jwt/3-proyecto/starter
pnpm install && cp .env.example .env && docker compose up -d
pnpm seed    # usuarios de prueba (opcional)
pnpm dev
```

## Semana 08 — Autorización y Seguridad

- **RBAC** con `requireRole()`: 401 sin token, 403 sin el rol requerido
- **Helmet** (12 headers de seguridad), **CORS con whitelist**, **rate limiting**
  (global 100/15min, auth 5/15min) y **sanitización anti-NoSQL injection**
- Lectura pública del catálogo; creación autenticada; edición del dueño o admin;
  eliminación solo admin
- Incluye notas de compatibilidad con Express 5 (ver README del proyecto)

```bash
cd week-08-autorizacion_seguridad/3-proyecto/starter
pnpm install && cp .env.example .env && docker compose up -d
pnpm dev
```

## Requisitos

- Node.js >= 22
- pnpm >= 10
- Docker (para MongoDB) o una instancia de MongoDB accesible

## Verificación realizada

Ambos proyectos fueron verificados con typecheck estricto (`tsc --noEmit`) y
pruebas end-to-end de la API (registro, login, cookies, refresh, logout, CRUD,
RBAC 401/403, headers de seguridad, CORS, rate limiting y sanitización).
