# NewListed — Sistema POS y Facturación Multi-Tenant en la Nube

> **Repositorio GitHub:** `https://github.com/Tupap1/NewListed`  
> **Visibilidad:** Public  
> **Carpeta Local:** `C:\Proyectos\NewListed`  
> **Estado:** Producción / Despliegue en Railway  

---

## Overview

**NewListed** es la evolución y reescritura de la plataforma POS y facturación SaaS para comercios y puntos de venta minoristas. Proporciona una solución completa en la nube para el registro de ventas, control de inventario multisede, cálculo detallado de impuestos por producto (*Tax per Item*) y emisión de facturas electrónicas, desplegado sobre infraestructura moderna y escalable.

---

## Architecture

Arquitectura moderna desacoplada con backend en FastAPI y frontend en Next.js, preparada para despliegue continuo en la nube (Railway):

```
 ┌────────────────────────────────────────────────────────┐
 │                 Frontend (Next.js / Vercel)            │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │  Next.js App Router + React + Tailwind CSS       │  │
 │  │  Punto de Venta Táctil & Panel de Administración │  │
 │  └──────────────────────────┬───────────────────────┘  │
 └─────────────────────────────┼──────────────────────────┘
                               │ HTTPS / JSON API
                               ▼
 ┌────────────────────────────────────────────────────────┐
 │              Backend API (FastAPI / Railway)           │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │  Python FastAPI + SQLAlchemy + Pydantic          │  │
 │  │  - Motor de Cálculo Fiscal (IVA por Ítem)        │  │
 │  │  - Control Multi-Tenant e Inventarios            │  │
 │  │  - Migraciones Alembic                           │  │
 │  └──────────────────────────┬───────────────────────┘  │
 └─────────────────────────────┼──────────────────────────┘
                               ▼
 ┌────────────────────────────────────────────────────────┐
 │                 PostgreSQL Cloud Database              │
 └────────────────────────────────────────────────────────┘
```

### Decisiones de Diseño Clave:
1. **Motor Fiscal de Alta Precisión (*Tax Per Item*):** Reingeniería documentada en `CRITICAL_FIX_TAX_PER_ITEM.md` para calcular impuestos a nivel de línea individual, evitando discrepancias de redondeo en facturas con múltiples tipos de IVA (0%, 5%, 19%).
2. **Migraciones Versionadas con Alembic:** Control de cambios de base de datos documentado paso a paso en `MIGRATION_EXECUTED.md`.
3. **Despliegue Contenedorizado en Railway:** Configuración declarativa en `railway.toml` y `docker-compose.yml` para ambientes de producción y staging.

---

## Tech Stack

### Backend (`backend/requirements.txt`)
- **Lenguaje:** Python 3.11+
- **Framework API:** FastAPI, Uvicorn
- **ORM & Base de Datos:** SQLAlchemy, Alembic, `asyncpg` / `psycopg2-binary`
- **Validación de Datos:** Pydantic v2
- **Seguridad:** `passlib`, `python-jose` (JWT Auth)

### Frontend (`frontend/package.json`)
- **Framework Web:** Next.js (App Router), React
- **Estilos & UI:** Tailwind CSS, Shadcn UI / Radix UI, Lucide React

### Infraestructura & Despliegue
- **Cloud Provider:** Railway (`railway.toml`), Docker (`docker-compose.yml`)
- **Base de Datos:** PostgreSQL

---

## Key Features

- **Punto de Venta Ágil:** Registro de tickets de compra con cálculo instantáneo de subtotales, descuentos y desgloses de impuestos.
- **Gestión Multi-Inquilino (Multi-Tenant):** Cada empresa cuenta con aislamiento de sus datos, usuarios, catálogos y sedes.
- **Kardex y Control de Existencias:** Seguimiento de entradas, salidas y transferencias entre bodegas.
- **Reportes de Cierre de Caja:** Conciliación de métodos de pago (efectivo, tarjeta, transferencias bancarias).

---

## Setup & Run

### Requisitos Previos
- Docker Desktop (para entorno completo)
- Python 3.11+ y Node.js 18+ (para desarrollo local)

### Ejecución con Docker Compose
```bash
docker compose up -d --build
```

### Ejecutar Backend en Desarrollo
```bash
cd backend
python -m venv venv
.env\Scriptsctivate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Ejecutar Frontend en Desarrollo
```bash
cd frontend
npm install
npm run dev
```

---

## Status

- **Fase Actual:** Producción / Desplegado en Railway.
- **Evidencia en Código:** Archivo de despliegue `railway.toml`, documentación de resolución fiscal `CRITICAL_FIX_TAX_PER_ITEM.md` y registro de migraciones ejecutadas en `MIGRATION_EXECUTED.md`.
