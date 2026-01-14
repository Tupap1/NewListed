# 🚀 GUÍA DE DESPLIEGUE EN RAILWAY.APP

**Proyecto:** Listed - Sistema de Gestión Contable  
**Tecnologías:** Flask + React + MySQL  
**Fecha:** 2026-01-14

---

## PREPARACIÓN PREVIA (YA REALIZADA) ✅

Los siguientes archivos ya están configurados:
- ✅ `backend/wsgi.py` - Entry point para Gunicorn
- ✅ `backend/Dockerfile` - Con Gunicorn y PORT dinámico
- ✅ `frontend/Dockerfile` - Build multi-stage con Nginx
- ✅ `frontend/nginx.conf` - Configuración SPA
- ✅ `.env.example` - Template de variables
- ✅ `backend/railway.json` - Configuración Railway

---

## PASOS EN RAILWAY.APP

### FASE 1: CREAR CUENTA Y PROYECTO

1. **Ir a** https://railway.app
2. **Sign up** con GitHub (recomendado)
3. **Click** en "New Project"
4. **Seleccionar** "Deploy from GitHub repo"

---

### FASE 2: CONECTAR REPOSITORIO

#### Paso 1: Autorizar Railway
```
1. Click "Configure GitHub App"
2. Selecciona tu organización/usuario
3. Autoriza acceso al repositorio "NewListed"
```

#### Paso 2: Seleccionar Repo
```
1. En la lista, busca "NewListed"
2. Click en el repositorio
3. Railway detectará los Dockerfiles
```

---

### FASE 3: CONFIGURAR BASE DE DATOS

#### Paso 1: Agregar Plugin MySQL
```
1. En el proyecto, click "+ New"
2. Selecciona "Database" → "Add MySQL"
3. Railway crea la base de datos automáticamente
4. Copia la variable DATABASE_URL (se genera automáticamente)
```

**Formato de DATABASE_URL:**
```
mysql://user:password@host:port/database
```

#### Paso 2: Adaptar para PyMySQL
Railway da URL con `mysql://`, pero Flask necesita `mysql+pymysql://`.

**En las variables del Backend (siguiente sección), modifica:**
```
DATABASE_URL = mysql+pymysql://user:password@host:port/database
```

---

### FASE 4: CONFIGURAR BACKEND SERVICE

#### Paso 1: Crear Servicio Backend
```
1. Click "+ New" → "GitHub Repo"
2. Selecciona "NewListed"
3. Railway detecta backend/Dockerfile
4. Nombra el servicio: "backend"
```

#### Paso 2: Configurar Root Directory
```
1. Click en el servicio "backend"
2. Settings → "Service Settings"
3. Root Directory: backend
4. Dockerfile Path: Dockerfile
5. Save
```

#### Paso 3: Configurar Variables de Entorno
```
1. Click en "backend" service
2. Tab "Variables"
3. Agregar las siguientes:
```

**Variables Requeridas:**
```bash
# Base de datos (Railway genera DATABASE_URL del plugin MySQL)
# Modifica el prefijo: mysql:// → mysql+pymysql://
DATABASE_URL=mysql+pymysql://root:password@containers-us-west-xxx.railway.app:6688/railway

# Flask settings
FLASK_ENV=production
FLASK_APP=wsgi:app
FLASK_DEBUG=0

# Secret key (GENERAR UNO NUEVO)
# Python: import secrets; print(secrets.token_hex(32))
SECRET_KEY=tu-secret-key-de-64-caracteres-aqui

# Port (Railway lo asigna automáticamente, pero puedes dejarlo)
# PORT se establece automáticamente
```

#### Paso 4: Generar SECRET_KEY
**Opción A: En tu terminal local:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Opción B: Online:**
https://randomkeygen.com/ (usa "CodeIgniter Encryption Keys")

#### Paso 5: Deploy Backend
```
1. Click "Deploy"
2. Railway construye la imagen Docker
3. Espera a que status = "Active" (verde)
4. Copia la URL del backend (ej: https://backend-production-xxx.up.railway.app)
```

---

### FASE 5: CONFIGURAR FRONTEND SERVICE

#### Paso 1: Crear Servicio Frontend
```
1. Click "+ New" → "GitHub Repo"
2. Selecciona "NewListed"
3. Railway detecta frontend/Dockerfile
4. Nombra el servicio: "frontend"
```

#### Paso 2: Configurar Root Directory
```
1. Click en "frontend" service
2. Settings → "Service Settings"
3. Root Directory: frontend
4. Dockerfile Path: Dockerfile
5. Save
```

#### Paso 3: Configurar Variables de Entorno
```
1. Click en "frontend" service
2. Tab "Variables"
3. Agregar:
```

**Variables Requeridas:**
```bash
# URL del backend (usa la URL que Railway generó para el backend)
VITE_API_URL=https://backend-production-xxx.up.railway.app

# Node environment
NODE_ENV=production
```

#### Paso 4: Deploy Frontend
```
1. Click "Deploy"
2. Railway ejecuta: npm ci → npm run build → nginx
3. Espera status = "Active"
4. Copia la URL del frontend (ej: https://frontend-production-xxx.up.railway.app)
```

---

### FASE 6: CONFIGURAR CORS (IMPORTANTE)

Como el frontend y backend están en dominios diferentes, necesitas habilitar CORS.

#### Paso 1: Actualizar backend/app/__init__.py
**Ya está configurado con `flask-cors`, pero verifica:**

```python
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # CORS configuration for Railway
    CORS(app, resources={
        r"/api/*": {
            "origins": os.environ.get('CORS_ORIGINS', '*').split(','),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    ...
```

#### Paso 2: Agregar Variable CORS_ORIGINS en Backend
```
1. Backend service → Variables
2. Agregar:
   CORS_ORIGINS=https://frontend-production-xxx.up.railway.app
```

---

### FASE 7: VERIFICAR DESPLIEGUE

#### Checklist:
```
✅ MySQL Database online (check Railway dashboard)
✅ Backend service status = Active (verde)
✅ Frontend service status = Active (verde)
✅ Backend logs sin errores (click "View Logs")
✅ Frontend URL accesible
```

#### Probar la Aplicación:
```
1. Accede a https://frontend-production-xxx.up.railway.app
2. Navega a "Bóveda XML"
3. Intenta subir un archivo XML
4. Verifica que la tabla cargue datos
5. Click "Ver" en una factura → Modal debe aparecer
6. Intenta exportar a Excel
```

---

## TROUBLESHOOTING COMÚN

### Error: "Can't connect to MySQL server"
**Solución:**
1. Verifica que `DATABASE_URL` tenga el prefijo `mysql+pymysql://`
2. Verifica que el servicio MySQL esté "Active"
3. Reinicia el backend service

### Error: "502 Bad Gateway"
**Solución:**
1. Check backend logs para errores
2. Verifica que Gunicorn esté escuchando en `$PORT`
3. Verifica que `wsgi.py` exista

### Error: "CORS policy has blocked"
**Solución:**
1. Agrega variable `CORS_ORIGINS` en backend
2. Reinicia backend service
3. Verifica que flask-cors esté en requirements.txt

### Frontend no carga datos
**Solución:**
1. Verifica `VITE_API_URL` en frontend variables
2. Abre DevTools → Network tab → Busca llamadas /api/xml/list
3. Verifica que la URL del backend sea correcta

### Build fails: "Module not found"
**Solución:**
1. Verifica que `requirements.txt` (backend) o `package.json` (frontend) estén actualizados
2. Railway → Settings → Trigger deploy

---

## CONFIGURACIÓN DE DOMINIO PERSONALIZADO (OPCIONAL)

### Paso 1: En Railway
```
1. Frontend service → Settings
2. "Domains" → "Generate Domain"
3. O "Custom Domain" → Agrega tu dominio
```

### Paso 2: En tu proveedor DNS
```
1. Agrega registro CNAME:
   Nombre: www (o @)
   Valor: xxx.up.railway.app
2. Espera propagación (5-60 min)
```

---

## MONITOREO Y LOGS

### Ver Logs en Tiempo Real:
```
1. Click en el servicio (backend o frontend)
2. Tab "Deployments"
3. Click en el deployment activo
4. "View Logs"
```

### Métricas:
```
1. Service → "Metrics"
2. Ver CPU, RAM, Network
```

---

## COSTOS ESTIMADOS (Railway)

**Plan Hobby (Gratuito con límites):**
- $5 USD de crédito/mes gratis
- Suficiente para desarrollo/testing

**Plan Pro (Recomendado para producción):**
- $20 USD/mes
- Incluye:
  - MySQL persistente
  - Múltiples servicios
  - Métricas avanzadas
  - Mayor CPU/RAM

**Estimación para Listed:**
- Backend + Frontend + MySQL ≈ $10-15 USD/mes en Pro
- Start con plan gratuito para probar

---

## ACTUALIZACIONES FUTURAS

### Cada vez que hagas cambios en GitHub:
```
1. Push a tu repositorio
2. Railway detecta el cambio automáticamente
3. Redeploy automático (si está habilitado)
```

### Redeploy Manual:
```
1. Service → Deployments
2. Click "Deploy" (latest) → "Redeploy"
```

---

## BACKUP DE BASE DE DATOS

### Opción 1: Desde Railway Dashboard
```
1. MySQL service → "Data"
2. "Export Database"
3. Descarga .sql
```

### Opción 2: Desde Terminal
```bash
# Conecta a MySQL de Railway
railway run mysql -h <host> -u <user> -p <database>

# Dump
mysqldump -h <host> -u <user> -p <database> > backup.sql
```

---

## ROLLBACK EN CASO DE ERROR

```
1. Service → "Deployments"
2. Busca el deployment anterior (status: Success)
3. Click "..." → "Rollback"
```

---

## CHECKLIST FINAL ✅

Antes de ir a producción completa:

- [ ] `SECRET_KEY` generado y configurado
- [ ] `DATABASE_URL` con prefijo `mysql+pymysql://`
- [ ] `CORS_ORIGINS` configurado
- [ ] `VITE_API_URL` apunta al backend en Railway
- [ ] Backend logs sin errores
- [ ] Frontend carga correctamente
- [ ] Subir XMLs funciona
- [ ] Exportar Excel funciona
- [ ] Modal InvoicePreview funciona
- [ ] Tema dark/light funciona
- [ ] Dominio personalizado configurado (opcional)
- [ ] Backup de base de datos programado

---

## RECURSOS ADICIONALES

- **Railway Docs:** https://docs.railway.app
- **Flask en Producción:** https://flask.palletsprojects.com/en/stable/deploying/
- **Gunicorn Docs:** https://docs.gunicorn.org/

---

**¡Tu aplicación está lista para desplegar en Railway!** 🚀

**Timestamp:** 2026-01-14  
**Autor:** DevOps Team  
**Contacto:** Support en Railway Discord
