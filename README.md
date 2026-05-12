# Appointment Management System

Sistema de gestión de citas de entrega de mercancía para empresa de retail textil.

## Stack
- **Backend**: Django 4.2 + Django REST Framework + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS *(pendiente)*
- **Auth**: JWT via `djangorestframework-simplejwt`
- **Docs**: Swagger/OpenAPI via `drf-spectacular`

## Levantar con Docker (recomendado)

```bash
cp .env.example .env          # Ajustar valores si es necesario
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| API REST | http://localhost:8000/api/ |
| Swagger UI | http://localhost:8000/api/docs/ |
| Django Admin | http://localhost:8000/admin/ |

## Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.

---

*README completo con arquitectura, ER diagram y decisiones técnicas se documenta en fases posteriores.*
