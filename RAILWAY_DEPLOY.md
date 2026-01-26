# 🚂 Guía de Despliegue en Railway - NewListed

## ⚠️ PROBLEMA COMÚN: Variables de Entorno en Vite

**Vite inyecta las variables de entorno en TIEMPO DE BUILD, NO en tiempo de ejecución.**

Esto significa que debes configurar `VITE_API_URL` como **Build Argument** en Railway.

---

## 📋 Configuración del Frontend en Railway

### 1. **Variables de Entorno del Servicio Frontend**

Ve a tu servicio frontend en Railway → **Variables** y agrega:

```bash
VITE_API_URL=https://newlisted-production.up.railway.app
```

⚠️ **NOTA**: Reemplaza `newlisted-production.up.railway.app` con la URL real de tu servicio backend.

### 2. **Dockerfile del Frontend**

El Dockerfile ya está configurado correctamente para recibir `VITE_API_URL` como `ARG`:

```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
```

Railway automáticamente pasará las variables de entorno como build arguments.

### 3. **Verifica el Build**

En los logs de Railway, deberías ver:

```
Building with API URL: https://newlisted-production.up.railway.app
```

---

## 📋 Configuración del Backend en Railway

### Variables de Entorno del Servicio Backend

```bash
DATABASE_URL=mysql://user:pass@host:3306/dbname
FLASK_ENV=production
```

---

## 🔄 Orden de Despliegue

1. **Primero:** Despliega el BACKEND
2. **Segundo:** Copia la URL del backend
3. **Tercero:** Configura `VITE_API_URL` en el frontend con la URL del backend
4. **Cuarto:** Re-despliega el frontend (trigger manual o push)

---

## 🐛 Troubleshooting

### Error: `POST 405 Method Not Allowed`

**Causa:** El frontend está haciendo peticiones a su propia URL en lugar del backend.

**Solución:**
1. Verifica que `VITE_API_URL` esté configurada en Railway
2. Re-despliega el frontend (la variable solo se inyecta en build time)
3. Verifica los logs de build: `Building with API URL: ...`

### Error: `Cannot read properties of undefined`

**Causa:** La variable `VITE_API_URL` no se pasó correctamente al build.

**Solución:**
1. En Railway, ve a Settings → Build Arguments
2. Verifica que `VITE_API_URL` esté en las variables de entorno
3. Railway automáticamente las convierte en build args

### Verificar en el Navegador

Abre la consola del navegador (F12) y busca:

```
🚀 Axios Config - API URL: https://newlisted-production.up.railway.app
```

Si ves `/api` en producción, significa que la variable no se inyectó correctamente.

---

## 📝 Checklist de Despliegue

- [ ] Backend desplegado y funcionando
- [ ] URL del backend copiada
- [ ] `VITE_API_URL` configurada en el servicio frontend de Railway
- [ ] Frontend re-desplegado
- [ ] Logs de build muestran la URL correcta
- [ ] Consola del navegador muestra la URL correcta
- [ ] Las peticiones API funcionan (revisar Network tab en DevTools)

---

## 🔧 Comandos Útiles Localmente

```bash
# Desarrollo local (usa proxy de Vite)
npm run dev

# Build de producción con variable de entorno
VITE_API_URL=https://tu-backend.railway.app npm run build

# Previsualizar build de producción
npm run preview
```

---

## 📚 Documentación

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway Build Args](https://docs.railway.app/deploy/builds#build-arguments)
