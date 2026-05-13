# Appointment Management System

1Sistema de gestión de citas de entrega de mercancía para una empresa de retail textil.  
Permite registrar, consultar y gestionar citas de entrega por proveedor y sublínea de producto, con reporte de tiempos promedio de entrega.

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend — Next.js 14 (App Router)         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  /login     │  │ /appointments│  │   /reports         │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
│  Axios + JWT interceptor  │  Tailwind CSS + shadcn/ui        │
└───────────────────────────┼─────────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend — Django REST Framework                  │
│                                                             │
│  ┌──────────────────┐     ┌───────────────────────────────┐ │
│  │  apps/           │     │  config/                      │ │
│  │  authentication/ │     │  settings/base.py             │ │
│  │  ├ views.py      │     │  settings/development.py      │ │
│  │  ├ serializers   │     │  settings/production.py       │ │
│  │  └ urls.py       │     │  urls.py                      │ │
│  │                  │     └───────────────────────────────┘ │
│  │  appointments/   │                                       │
│  │  ├ models.py     │  ← ORM (CRUD)                        │
│  │  ├ views.py      │                                       │
│  │  ├ serializers   │                                       │
│  │  ├ filters.py    │                                       │
│  │  ├ reports.py    │  ← SQL nativo (reporte)              │
│  │  └ urls.py       │                                       │
│  └──────────────────┘                                       │
│                                                             │
│  JWT Auth (simplejwt)  │  Swagger (drf-spectacular)        │
└───────────────────────────┬─────────────────────────────────┘
                            │ psycopg2
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL 16                               │
│   appointments_appointment  │  auth_user                    │
│   token_blacklist_*         │  django_migrations            │
└─────────────────────────────────────────────────────────────┘
```

---

## Diagrama Entidad-Relación

```
┌──────────────────────────────┐       ┌──────────────────────────────────┐
│         auth_user            │       │     appointments_appointment     │
├──────────────────────────────┤       ├──────────────────────────────────┤
│ id            INTEGER (PK)   │       │ id            UUID (PK)          │
│ username      VARCHAR        │       │ scheduled_at  TIMESTAMPTZ   (idx)│
│ password      VARCHAR        │       │ supplier      VARCHAR(1)    (idx)│
│ email         VARCHAR        │       │ product_line  VARCHAR(20)   (idx)│
│ first_name    VARCHAR        │◄──────│ status        VARCHAR(20)   (idx)│
│ last_name     VARCHAR        │       │ delivered_at  TIMESTAMPTZ (null) │
│ is_staff      BOOLEAN        │       │ observations  TEXT               │
│ is_active     BOOLEAN        │       │ created_by_id INTEGER (FK)       │
└──────────────────────────────┘       │ created_at    TIMESTAMPTZ        │
                                       │ updated_at    TIMESTAMPTZ        │
                                       └──────────────────────────────────┘

Choices:
  supplier      → A | B | C
  product_line  → shirts | pants | shoes | accessories
  status        → scheduled | in_progress | delivered | cancelled

Transiciones de estado permitidas:
  scheduled   → in_progress | cancelled
  in_progress → delivered   | cancelled
  delivered   → (terminal)
  cancelled   → (terminal)
```

---

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Backend | Django 4.2 + DRF | Maduro, ORM potente, excelente soporte para REST y SQL nativo |
| Base de datos | PostgreSQL 16 | Soporte nativo para `EXTRACT(EPOCH FROM ...)` requerido en el reporte; robusto para producción |
| Autenticación | JWT (simplejwt) | Stateless, ideal para SPA; no requiere manejo de sesiones en servidor |
| Docs API | drf-spectacular | Genera OpenAPI 3.0 automáticamente desde ViewSets y Serializers |
| Frontend | Next.js 14 (App Router) | SSR/SSG, TypeScript nativo, routing basado en carpetas, excelente DX |
| Estilos | Tailwind CSS + shadcn/ui | Utility-first mobile-first, componentes accesibles sin sobrecargar el bundle |
| Contenedores | Docker + Compose | Un solo comando levanta toda la solución: BD + backend + frontend |

---

## Decisión de Autenticación — JWT

Se eligió **JWT** sobre sesiones Django por las siguientes razones:

1. **Stateless**: el backend no almacena estado de sesión; escala horizontalmente sin configuración adicional.
2. **SPA-friendly**: el frontend Next.js consume la API directamente; JWT se transporta en el header `Authorization: Bearer`.
3. **Token refresh**: `ROTATE_REFRESH_TOKENS = True` emite un nuevo refresh en cada uso, reduciendo la ventana de ataque.
4. **Blacklist**: `token_blacklist` invalida tokens en logout explícito, compensando la naturaleza stateless de JWT.
5. **Configuración sensible en variables de entorno**: tiempos de expiración configurables por `.env`.

---

## Instalación y Ejecución

### Con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jhonce11/appointment_management.git
cd appointment_management

# 2. Crear archivo de variables de entorno
cp .env.example .env

# 3. Levantar toda la solución
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| API REST | http://localhost:8000/api/ |
| Swagger UI | http://localhost:8000/api/docs/ |
| Django Admin | http://localhost:8000/admin/ |

Al iniciar, Docker ejecuta automáticamente:
- `migrate` — crea todas las tablas
- `create_test_users` — crea 3 usuarios de prueba
- `seed_data` — inserta 20 citas de ejemplo

### Sin Docker (desarrollo local)

```bash
# Requisitos: Python 3.12+, PostgreSQL 16

cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac

pip install -r requirements/development.txt

# Crear .env en la raíz del proyecto (ajustar POSTGRES_HOST=localhost)
python manage.py migrate
python manage.py create_test_users
python manage.py seed_data
python manage.py runserver
```

---

## Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `Admin1234!` | Superusuario (acceso a /admin/) |
| `operador1` | `Oper1234!` | Usuario estándar |
| `operador2` | `Oper1234!` | Usuario estándar |

---

## Variables de Entorno

Ver `.env.example` para la lista completa. Variables principales:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DJANGO_SECRET_KEY` | Clave secreta Django | *(requerida)* |
| `DJANGO_DEBUG` | Modo debug | `True` |
| `POSTGRES_DB` | Nombre de la BD | `appointments_db` |
| `POSTGRES_USER` | Usuario PostgreSQL | `appointments_user` |
| `POSTGRES_PASSWORD` | Contraseña PostgreSQL | `appointments_pass` |
| `POSTGRES_HOST` | Host PostgreSQL | `db` (Docker) / `localhost` (local) |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Duración access token | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Duración refresh token | `7` |
| `NEXT_PUBLIC_API_URL` | URL base de la API para el frontend | `http://localhost:8000/api` |

---

## Documentación de la API

Swagger UI disponible en: **http://localhost:8000/api/docs/**  
Schema OpenAPI (YAML): http://localhost:8000/api/schema/

### Endpoints principales

#### Autenticación — `/api/auth/`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login/` | Login, retorna `access` + `refresh` + usuario | ❌ |
| POST | `/api/auth/logout/` | Invalida el refresh token | ✅ |
| POST | `/api/auth/refresh/` | Renueva el access token | ❌ |
| GET | `/api/auth/me/` | Datos del usuario autenticado | ✅ |

#### Citas — `/api/appointments/`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/appointments/` | Listar citas (filtros + paginación) | ✅ |
| POST | `/api/appointments/` | Crear nueva cita | ✅ |
| GET | `/api/appointments/{id}/` | Detalle de una cita | ✅ |
| PATCH | `/api/appointments/{id}/` | Actualizar cita | ✅ |
| POST | `/api/appointments/{id}/cancel/` | Cancelar cita | ✅ |
| DELETE | `/api/appointments/{id}/` | No permitido (405) | ✅ |

**Filtros disponibles en GET `/api/appointments/`:**

| Parámetro | Tipo | Ejemplo |
|-----------|------|---------|
| `supplier` | string | `?supplier=A` |
| `product_line` | string | `?product_line=shirts` |
| `status` | string | `?status=scheduled` |
| `date_from` | datetime | `?date_from=2026-05-01` |
| `date_to` | datetime | `?date_to=2026-12-31` |
| `ordering` | string | `?ordering=-scheduled_at` |
| `page` | int | `?page=2` |

#### Reporte — `/api/reports/`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports/delivery-times/` | Promedio de entrega por sublínea (SQL nativo) | ✅ |

**Parámetros requeridos:** `date_from`, `date_to`  
**Ejemplo:** `/api/reports/delivery-times/?date_from=2026-01-01&date_to=2026-12-31`

---

## Cómo Correr las Pruebas

```bash
# Dentro del contenedor Docker
docker exec -it appointment_management-backend-1 pytest tests/ -v

# En local (con .venv activo)
cd backend
pytest tests/ -v
```

**Cobertura de tests (14 tests):**

| Archivo | Tests |
|---------|-------|
| `test_auth.py` | Login válido, credenciales inválidas, 401 sin token, endpoint /me |
| `test_appointments.py` | Fecha en pasado, fecha futura, delivered sin delivered_at, transición inválida, cancel, DELETE 405, 401 sin token |
| `test_reports.py` | Campos esperados, sin parámetros retorna 400, 401 sin token |

---

## Estructura del Proyecto

```
appointment_management/
├── backend/
│   ├── apps/
│   │   ├── authentication/     # Login, logout, JWT, /me
│   │   │   ├── management/commands/create_test_users.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── appointments/       # CRUD + reporte
│   │       ├── management/commands/seed_data.py
│   │       ├── migrations/
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── filters.py
│   │       ├── views.py
│   │       ├── reports.py      # SQL nativo
│   │       ├── report_views.py
│   │       └── urls.py
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py         # Configuración común
│   │   │   ├── development.py  # DEBUG=True, CORS abierto
│   │   │   └── production.py   # DEBUG=False
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_appointments.py
│   │   └── test_reports.py
│   ├── requirements/
│   │   ├── base.txt
│   │   └── development.txt
│   ├── .flake8
│   └── Dockerfile
├── frontend/                   # Next.js 14 — en desarrollo
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Supuestos Asumidos

1. **Un usuario puede crear múltiples citas** — no hay restricción de una cita por proveedor/fecha.
2. **Las citas canceladas y entregadas son terminales** — no se puede cambiar su estado una vez alcanzado.
3. **`scheduled_at` no puede ser en el pasado** solo al crear — al editar otros campos de una cita existente no se revalida la fecha.
4. **El reporte filtra por `scheduled_at`** (no por `delivered_at`) para el rango de fechas, tal como indica el enunciado.
5. **Zona horaria**: configurada como `America/Bogota` (UTC-5); todos los timestamps se almacenan en UTC y se convierten al leer.
6. **No hay roles diferenciados** — cualquier usuario autenticado puede crear y gestionar citas. Un sistema de permisos por rol se puede agregar como mejora futura.
