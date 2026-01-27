# 🧪 GUÍA DE PRUEBAS - NewListed

## 📋 ANTES DE EMPEZAR

Asegúrate de que:
1. El backend Flask está corriendo (`docker-compose up` o similar)
2. El frontend React está corriendo (`npm run dev`)
3. Tienes al menos 2-3 facturas XML cargadas en el sistema

---

## ✅ TEST 1: ELIMINAR FACTURA (Full Stack)

### Objetivo
Verificar que puedes eliminar una factura desde la interfaz web y que se elimina correctamente de la base de datos.

### Pasos
1. **Navega a la página de XML** (generalmente `/xml` o `/`)

2. **Localiza una factura en la tabla**
   - Deberías ver las columnas: No. Factura, Fecha, Emisor, Receptor, Total, Acciones

3. **Identifica el botón de papelera**
   - En la columna "Acciones", deberías ver 2 botones:
     - 👁️ Ojo (azul) - Ver factura
     - 🗑️ Papelera (rojo) - Eliminar factura

4. **Click en el botón de papelera**
   - Debería aparecer un cuadro de confirmación con el mensaje:
     ```
     ¿Estás seguro de eliminar la factura [NÚMERO]?
     
     Esta acción no se puede deshacer.
     ```

5. **Cancela primero (prueba negativa)**
   - Click en "Cancelar"
   - Verifica que la factura sigue en la lista

6. **Elimina (prueba positiva)**
   - Click de nuevo en el botón de papelera
   - Click en "Aceptar"
   - Deberías ver una alerta: "Factura eliminada exitosamente"
   - La tabla debería recargarse automáticamente
   - La factura eliminada **NO** debería aparecer más en la lista

### Verificación Backend (Opcional)
```sql
-- Conéctate a MySQL y verifica que la factura fue eliminada
SELECT * FROM invoices WHERE id = [ID_DE_LA_FACTURA_ELIMINADA];
-- No debería retornar ningún resultado

-- Verifica también que los items relacionados fueron eliminados (cascade)
SELECT * FROM invoice_items WHERE invoice_id = [ID_DE_LA_FACTURA_ELIMINADA];
-- No debería retornar ningún resultado
```

### ✅ Resultado Esperado
- Confirmación antes de eliminar
- Eliminación exitosa
- Recarga automática de la tabla
- Factura ya no visible en la lista

---

## ✅ TEST 2: COLUMNAS DINÁMICAS EN EXCEL

### Objetivo
Verificar que el Excel generado contiene columnas individuales para cada tipo de impuesto encontrado en las facturas, en lugar de un string concatenado.

---

### **ESCENARIO A: Solo Facturas con IVA 19%**

#### Preparación
1. Asegúrate de tener solo facturas con IVA del 19% cargadas
2. Si tienes facturas con otros impuestos, elimínalas primero (usando el botón de papelera)

#### Pasos
1. Click en el botón **"Exportar Excel"** (verde, arriba a la derecha)
2. El navegador descargará `facturas_export.xlsx`
3. Abre el archivo en Excel/LibreOffice

#### Verifica
- ✅ Deberías ver una columna llamada **"Valor IVA 19%"**
- ✅ En esa columna, deberías ver valores numéricos (ej: 190, 95.5, etc.)
- ❌ **NO** deberías ver columnas para otros impuestos (ej: "Valor IVA 5%")
- ❌ **NO** deberías ver una columna "Impuestos (Desglose)" con strings

#### Ejemplo esperado:
```
| Número Factura | Fecha      | Total Factura | Valor IVA 19% | Descripción Ítem  |
|----------------|------------|---------------|---------------|-------------------|
| BRZ2975        | 2026-01-20 | 1190          | 190           | Producto A        |
| BRZ2976        | 2026-01-21 | 595           | 95            | Servicio B        |
```

---

### **ESCENARIO B: Facturas Mixtas (Múltiples Impuestos)**

#### Preparación
1. Carga XMLs con diferentes tarifas de IVA:
   - Algunas con IVA 19%
   - Algunas con IVA 5%
   - Algunas con IVA 0% (si aplica)
   - Algunas con INC (Impuesto al Consumo)

#### Pasos
1. Click en **"Exportar Excel"**
2. Descarga y abre el archivo

#### Verifica
- ✅ Deberías ver múltiples columnas de impuestos:
  - `Valor IVA 19%`
  - `Valor IVA 5%`
  - `Valor INC 8%` (u otros que existan)
- ✅ Cada factura tiene el valor correcto en SU columna
- ✅ Las celdas donde no aplica el impuesto deberían tener `0`

#### Ejemplo esperado:
```
| Número Factura | Total | Valor IVA 19% | Valor IVA 5% | Valor INC 8% | Descripción Ítem |
|----------------|-------|---------------|--------------|--------------|------------------|
| BRZ2975        | 1190  | 190           | 0            | 0            | Laptop           |
| BRZ2976        | 525   | 0             | 25           | 0            | Libro            |
| BRZ2977        | 1080  | 80            | 0            | 0            | Monitor          |
| BRZ2978        | 200   | 0             | 0            | 16           | Bebida Azucarada |
```

---

### **ESCENARIO C: Dataset Vacío (Edge Case)**

#### Pasos
1. Elimina TODAS las facturas (usando el botón de papelera)
2. Click en **"Exportar Excel"**

#### Verifica
- ✅ El archivo debería descargarse sin errores
- ✅ El Excel debería tener solo el encabezado (sin filas de datos)
- ✅ Las columnas básicas deberían existir
- ✅ NO debería haber columnas de impuestos (porque no hay datos)

---

## 🔍 VERIFICACIÓN TÉCNICA (Para Desarrolladores)

### Logs del Backend
Al exportar, deberías ver en la consola del backend algo como:
```
INFO: Found 3 unique tax types: ['IVA 19%', 'IVA 5%', 'INC 8%']
INFO: Generated Excel with 47 rows and 18 columns
INFO: Tax columns: ['Valor IVA 19%', 'Valor IVA 5%', 'Valor INC 8%']
```

### Inspección del DataFrame (Debug)
Si quieres debuggear, puedes añadir temporalmente en `services.py`:
```python
# Después de crear el DataFrame
print(df.head())
print(df.columns.tolist())
```

---

## ❌ PROBLEMAS COMUNES

### Problema 1: Sigue Apareciendo "Impuestos (Desglose)"
**Solución**: Verifica que estés usando la versión actualizada del archivo `services.py`. Reinicia el backend.

### Problema 2: No Se Eliminan las Facturas
**Verificar**:
1. ¿El endpoint DELETE está correctamente registrado en `routes.py`?
2. ¿El backend muestra errores en la consola?
3. ¿La consola del navegador (F12) muestra algún error 404 o 500?

### Problema 3: Columnas de Impuestos Vacías
**Verificar**:
1. ¿Las facturas realmente tienen impuestos en el campo `json_taxes`?
2. Verifica en la base de datos:
   ```sql
   SELECT invoice_number, json_taxes FROM invoices LIMIT 5;
   ```
3. Deberías ver algo como: `{"IVA 19%": 190.0, "INC 8%": 80.0}`

---

## 📊 CHECKLIST FINAL

### Funcionalidad de Eliminación
- [ ] Botón de papelera visible en la columna "Acciones"
- [ ] Confirmación aparece al hacer click
- [ ] Factura se elimina correctamente
- [ ] Tabla se recarga automáticamente
- [ ] Items relacionados también se eliminan (verificar en BD)

### Funcionalidad de Excel Dinámico
- [ ] Columnas de impuestos son individuales (no strings)
- [ ] Solo aparecen columnas para impuestos que existen
- [ ] Valores numéricos correctos en cada columna
- [ ] Celdas con 0 cuando no aplica el impuesto
- [ ] Orden de columnas lógico (info factura → impuestos → items → UUID)

---

## 🚀 SIGUIENTE NIVEL (Opcional)

Si todo funciona, podrías mejorar:

1. **Modal de Confirmación Elegante**
   - Reemplazar `window.confirm` por un modal React bonito

2. **Filtros para Exportación**
   - Añadir filtros de fecha antes de exportar
   - Exportar solo facturas seleccionadas

3. **Totales en Excel**
   - Añadir fila final con sumas de cada columna de impuestos

4. **Undo Delete**
   - Implementar soft delete (marcar como eliminado)
   - Permitir restaurar facturas eliminadas

---

**¡Éxito con las pruebas! 🎉**
