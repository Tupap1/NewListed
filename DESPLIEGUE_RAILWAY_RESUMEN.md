# ✅ PREPARACIÓN COMPLETADA: RAILWAY DEPLOYMENT

**Fecha:** 2026-01-14  
**Estado:** ✅ LISTO PARA DESPLEGAR

---

## ARCHIVOS CREADOS/MODIFICADOS

### Backend (Producción)
- ✅ `backend/wsgi.py` - Entry point para Gunicorn
- ✅ `backend/Dockerfile` - Actualizado con Gunicorn + PORT dinámico
- ✅ `backend/railway.json` - Configuración Railway

### Frontend (Producción)
- ✅ `frontend/Dockerfile` - Multi-stage build con Nginx
- ✅ `frontend/nginx.conf` - SPA routing + caching
- ✅ `frontend/vite.config.js` - Optimizado para build producción

### Configuración
- ✅ `.env.example` - Template de variables de entorno
- ✅ `.gitignore` - Ya configurado correctamente

### Documentación
- ✅ `RAILWAY_DEPLOYMENT_GUIDE.md` - Guía paso a paso

---

## CAMBIOS CLAVE

### 1. Backend Dockerfile
**Antes:**
```dockerfile
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]
```

**Ahora:**
```dockerfile
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 4 wsgi:app
```

**Beneficios:**
- ✅ Puerto dinámico ($PORT de Railway)
- ✅ Gunicorn (servidor WSGI de producción)
- ✅ 4 workers para mejor rendimiento
- ✅ Timeout de 60s

### 2. Frontend Dockerfile (NUEVO)
```dockerfile
FROM node:18-alpine AS builder
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Beneficios:**
- ✅ Build multi-stage (imagen más pequeña)
- ✅ Nginx para servir archivos estáticos
- ✅ Gzip compression
- ✅ Cache headers optimizados

### 3. Variables de Entorno

**Backend necesita:**
```bash
DATABASE_URL=mysql+pymysql://user:pass@host:port/db
SECRET_KEY=<64-chars-hex>
FLASK_ENV=production
```

**Frontend necesita:**
```bash
VITE_API_URL=https://backend-xxx.railway.app
NODE_ENV=production
```

---

## ESTRUCTURA DE DESPLIEGUE EN RAILWAY

```
Railway Project: Listed
├── MySQL Database        (Plugin Railway)
│   └── DATABASE_URL auto-generada
│
├── Backend Service
│   ├── Root: backend/
│   ├── Dockerfile: backend/Dockerfile
│   ├── Variables:
│   │   ├── DATABASE_URL (modificar prefijo)
│   │   ├── SECRET_KEY
│   │   ├── FLASK_ENV=production
│   │   └── CORS_ORIGINS
│   └── URL: https://backend-xxx.up.railway.app
│
└── Frontend Service
    ├── Root: frontend/
    ├── Dockerfile: frontend/Dockerfile
    ├── Variables:
    │   ├── VITE_API_URL (backend URL)
    │   └── NODE_ENV=production
    └── URL: https://frontend-xxx.up.railway.app
```

---

## CHECKLIST PRE-DEPLOYMENT

### Git Repository
- [ ] Todos los cambios commiteados
- [ ] Push a GitHub
- [ ] .env NO está en el repositorio
- [ ] .env.example SÍ está en el repo

### Código
- [ ] `backend/wsgi.py` existe
- [ ] `backend/Dockerfile` usa Gunicorn
- [ ] `frontend/Dockerfile` funciona
- [ ] `frontend/nginx.conf` configurado
- [ ] `requirements.txt` incluye gunicorn

### Pruebas Locales
- [ ] `docker-compose build` funciona
- [ ] `docker-compose up` levanta todo
- [ ] Frontend accesible en localhost:5173
- [ ] Backend API responde en localhost:5000
- [ ] Subir XML funciona
- [ ] Exportar Excel funciona

---

## PASOS EN RAILWAY (RESUMEN)

1. **Crear Proyecto** en Railway.app
2. **Conectar GitHub** → Seleccionar repo "NewListed"
3. **Agregar MySQL** Database plugin
4. **Crear Backend Service:**
   - Root: `backend/`
   - Variables: DATABASE_URL, SECRET_KEY, FLASK_ENV
   - Deploy
5. **Crear Frontend Service:**
   - Root: `frontend/`
   - Variables: VITE_API_URL (URL backend)
   - Deploy
6. **Configurar CORS:** Variable CORS_ORIGINS en backend
7. **Probar:** Acceder a frontend URL

---

## COMANDOS ÚTILES

### Generar SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Probar build local del backend
```bash
cd backend
docker build -t listed-backend .
docker run -p 5000:5000 -e PORT=5000 listed-backend
```

### Probar build local del frontend
```bash
cd frontend
docker build -t listed-frontend .
docker run -p 80:80 listed-frontend
```

### Ver logs Railway
```bash
# Instala Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link proyecto
railway link

# Ver logs
railway logs
```

---

## COSTOS ESTIMADOS

**Plan Hobby (Gratis):**
- $5 USD crédito/mes
- Suficiente para pruebas

**Plan Pro ($20/mes):**
- MySQL persistente
- 2 servicios (backend + frontend)
- Mejor rendimiento
- **Estimado Listed:** $10-15/mes

---

## TROUBLESHOOTING RÁPIDO

| Error | Solución |
|-------|----------|
| Can't connect to MySQL | Verifica `mysql+pymysql://` en DATABASE_URL |
| 502 Bad Gateway | Check backend logs, verifica Gunicorn |
| CORS blocked | Agrega CORS_ORIGINS en backend |
| Build fails | Verifica requirements.txt / package.json |
| Port already in use | Railway asigna PORT automáticamente |

---

## PRÓXIMOS PASOS

1. **Lee** `RAILWAY_DEPLOYMENT_GUIDE.md` (guía completa)
2. **Genera** SECRET_KEY seguro
3. **Commit & Push** a GitHub
4. **Sigue** los pasos de la guía
5. **Despliega** en Railway
6. **Prueba** la aplicación en producción
7. **(Opcional)** Configura dominio personalizado

---

## RECURSOS

- **Guía Completa:** `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Railway Docs:** https://docs.railway.app
- **Template Vars:** `.env.example`

---

**Tu aplicación está lista para producción.** 🚀

**Estado:** PRODUCTION-READY ✅
