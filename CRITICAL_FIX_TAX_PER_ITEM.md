# 🔴 CORRECCIÓN CRÍTICA: IMPUESTOS POR ÍTEM (NO POR FACTURA)
**Fecha**: 2026-01-27  
**Prioridad**: CRÍTICA  
**Estado**: ✅ IMPLEMENTADO

---

## 🐛 PROBLEMA DETECTADO

### Descripción del Error
El sistema estaba asignando el **Total de Impuestos de la Factura** a **cada uno de los ítems** por igual.

### Ejemplo del Error (ANTES):
```
Factura con 2 productos:
- Papas (IVA 5%): $50
- Gaseosa (IVA 19%): $380

❌ ERROR: El reporte mostraba:
| Ítem    | Valor IVA 19% | Valor IVA 5% |
|---------|---------------|--------------|
| Papas   | 380           | 50           | ← INCORRECTO (tiene ambos impuestos)
| Gaseosa | 380           | 50           | ← INCORRECTO (tiene ambos impuestos)
```

**Causa Raíz**: Los impuestos se extraían del `<cac:TaxTotal>` del encabezado de la factura (que es el total consolidado) y se aplicaban a todos los ítems.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Cambio Arquitectónico
Los impuestos ahora se extraen a nivel de **cada `<cac:InvoiceLine>` individual**, no del encabezado global de la factura.

### Resultado Esperado (DESPUÉS):
```
✅ CORRECTO: El reporte ahora muestra:
| Ítem    | Base  | Valor IVA 19% | Valor IVA 5% |
|---------|-------|---------------|--------------|
| Gaseosa | 2000  | 380           | 0            | ← Solo IVA 19%
| Papas   | 1000  | 0             | 50           | ← Solo IVA 5%
```

---

## 📦 CAMBIOS IMPLEMENTADOS

### 1. Modelo de Datos (Database Schema)
**Archivo**: `backend/app/modules/xml/models.py`

```python
class InvoiceItem(db.Model):
    # ... campos existentes ...
    
    # NUEVO: Campo para almacenar impuestos a nivel de LÍNEA
    json_taxes = db.Column(db.Text, nullable=True)  # JSON: {"IVA 19%": 380}
```

**Migración SQL**: `backend/migrations/add_json_taxes_to_items.sql`
```sql
ALTER TABLE invoice_items 
ADD COLUMN json_taxes TEXT NULL 
AFTER total_line;
```

---

### 2. Parser XML (Parsing Logic)
**Archivo**: `backend/app/modules/xml/services.py`

#### ANTES (Incorrecto):
```python
# Leía impuestos del root de la factura
tax_subtotals = tree.xpath(".//cac:TaxTotal/cac:TaxSubtotal", ...)
# Aplicaba esos impuestos a TODOS los items
```

#### DESPUÉS (Correcto):
```python
for line in invoice_lines:
    # CRITICAL FIX: Extrae impuestos de ESTA línea específica
    line_tax_subtotals = line.xpath(".//cac:TaxTotal/cac:TaxSubtotal", ...)
    
    # Cada item tiene sus propios impuestos
    for subtotal in line_tax_subtotals:
        tax_name = get_text(".//cac:TaxCategory/cac:TaxScheme/cbc:Name", node=subtotal)
        tax_percent = get_text(".//cac:TaxCategory/cbc:Percent", node=subtotal)
        tax_value = get_text(".//cbc:TaxAmount", node=subtotal)
        
        line_taxes[f"{tax_name} {tax_percent}%"] = float(tax_value)
```

**Cambio Clave**: 
- `tree.xpath(...)` → busca en toda la factura ❌
- `line.xpath(...)` → busca solo en esa línea específica ✅

---

### 3. Generación de Excel (Export Logic)
**Archivo**: `backend/app/modules/xml/services.py` - Función `export_invoices_to_excel()`

#### ANTES (Incorrecto):
```python
# PASO 1: Escaneaba impuestos de FACTURAS
for inv in invoices:
    if inv.json_taxes:  # ← Impuestos de la factura completa
        taxes_dict = json.loads(inv.json_taxes)
        all_tax_keys.update(taxes_dict.keys())

# PASO 2: Aplicaba impuestos de la factura a todos los ítems
for item in inv.items:
    for tax_key in sorted_tax_keys:
        row[f"Valor {tax_key}"] = invoice_taxes.get(tax_key, 0)  # ← Mismos impuestos para todos
```

#### DESPUÉS (Correcto):
```python
# PASO 1: Escanea impuestos de ÍTEMS (no facturas)
for inv in invoices:
    for item in inv.items:  # ← Itera sobre items
        if item.json_taxes:  # ← Impuestos del ÍTEM
            item_taxes_dict = json.loads(item.json_taxes)
            all_tax_keys.update(item_taxes_dict.keys())

# PASO 2: Cada ítem usa SUS PROPIOS impuestos
for item in inv.items:
    item_taxes = json.loads(item.json_taxes) if item.json_taxes else {}
    
    for tax_key in sorted_tax_keys:
        # Solo el valor de ESTE ítem, no de la factura completa
        row[f"Valor {tax_key}"] = float(item_taxes.get(tax_key, 0))
```

**Resultado**: Matriz Dispersa (Sparse Matrix)
- Gaseosa tiene IVA 19% → columna IVA 19% = 380, columna IVA 5% = 0
- Papas tiene IVA 5% → columna IVA 19% = 0, columna IVA 5% = 50

---

### 4. Frontend (UI Display)
**Archivo**: `frontend/src/components/ui/InvoicePreview.jsx`

#### Columna "Impuesto" Agregada
```jsx
<thead>
    <th>Cantidad</th>
    <th>Descripción</th>
    <th>Vr. Unitario</th>
    <th>Impuesto</th>  {/* ← NUEVA COLUMNA */}
    <th>Total</th>
</thead>

<tbody>
    {invoice.items.map((item, idx) => {
        // Formatea impuestos de ESTE ítem
        let taxDisplay = 'Sin IVA';
        if (item.taxes && Object.keys(item.taxes).length > 0) {
            taxDisplay = Object.entries(item.taxes)
                .map(([name, value]) => `${name} ($${value})`)
                .join(', ');
        }
        
        return (
            <tr>
                <td>{item.quantity}</td>
                <td>{item.description}</td>
                <td>${item.unit_price}</td>
                <td>{taxDisplay}</td>  {/* Ej: "IVA 19% ($380)" */}
                <td>${item.total_line}</td>
            </tr>
        );
    })}
</tbody>
```

**Ejemplo de Display**:
- Gaseosa → "IVA 19% ($380)"
- Papas → "IVA 5% ($50)"
- Pan → "Sin IVA"

---

## 🧪 CÓMO VERIFICAR LA CORRECCIÓN

### Prueba 1: Cargar XML con Impuestos Mixtos
1. Consigue un XML de factura que tenga productos con diferentes IVAs:
   - Producto A con IVA 19%
   - Producto B con IVA 5%
   - Producto C sin IVA (0%)

2. Carga el XML en el sistema

3. **Verifica en la Base de Datos**:
   ```sql
   SELECT 
       i.invoice_number,
       item.description,
       item.json_taxes
   FROM invoices i
   JOIN invoice_items item ON item.invoice_id = i.id
   WHERE i.invoice_number = '[NÚMERO_DE_FACTURA]';
   ```
   
   **Resultado Esperado**:
   ```
   | invoice_number | description | json_taxes                |
   |----------------|-------------|---------------------------|
   | BRZ2975        | Gaseosa     | {"IVA 19%": 380.0}       |
   | BRZ2975        | Papas       | {"IVA 5%": 50.0}         |
   | BRZ2975        | Pan         | NULL o {}                |
   ```

### Prueba 2: Exportar Excel
1. Exporta la factura a Excel
2. Abre el archivo
3. **Verifica las columnas dinámicas**:
   
   ```
   | Descripción | Base | Valor IVA 19% | Valor IVA 5% | Valor IVA 0% |
   |-------------|------|---------------|--------------|--------------|
   | Gaseosa     | 2000 | 380           | 0            | 0            |
   | Papas       | 1000 | 0             | 50           | 0            |
   | Pan         | 500  | 0             | 0            | 0            |
   ```

### Prueba 3: Ver Detalle en Frontend
1. Click en el ícono de "Ver" (ojo) de la factura
2. En el modal, ve a la tabla de productos
3. **Verifica la columna "Impuesto"**:
   - Gaseosa: `IVA 19% ($380)`
   - Papas: `IVA 5% ($50)`
   - Pan: `Sin IVA`

---

## ⚠️ ACCIONES REQUERIDAS

### 1. Ejecutar Migración de Base de Datos
```bash
# Opción A: Si usas Docker
docker-compose exec db mysql -u root -p[PASSWORD] [DB_NAME] < backend/migrations/add_json_taxes_to_items.sql

# Opción B: MySQL directo
mysql -u root -p[PASSWORD] [DB_NAME] < backend/migrations/add_json_taxes_to_items.sql
```

### 2. Re-procesar Facturas Existentes (CRÍTICO)
**PROBLEMA**: Las facturas ya cargadas en la BD tienen `invoice_items.json_taxes = NULL` porque se cargaron con el código antiguo.

**SOLUCIÓN**: Tienes 2 opciones:

#### Opción A (Recomendada): Re-cargar las facturas
1. Elimina las facturas existentes (botón de papelera)
2. Vuelve a cargar los XMLs
3. Ahora se procesarán con el código corregido

#### Opción B (Avanzada): Script de migración de datos
Si tienes muchas facturas y no quieres re-cargarlas, necesitarías un script Python que:
1. Lea los XMLs originales
2. Re-parsee cada línea con el nuevo código
3. Actualice `invoice_items.json_taxes` en la BD

**Por simplicidad, recomiendo Opción A.**

---

## 📊 IMPACTO

### Datos Afectados
- **Facturas nuevas**: ✅ Se procesarán correctamente automáticamente
- **Facturas existentes**: ⚠️ Requieren re-procesamiento (ver arriba)

### Excel/Reportes
- **Antes**: Datos incorrectos (impuestos mezclados)
- **Después**: ✅ Cada ítem con sus impuestos correctos

### Frontend
- **Antes**: No se mostraban impuestos por producto
- **Después**: ✅ Columna "Impuesto" muestra detalle por producto

---

## 🎯 VERIFICACIÓN DE CALIDAD

### Checklist de Validación
- [x] Modelo actualizado con campo `json_taxes` en `InvoiceItem`
- [x] Parser XML extrae impuestos de cada `<cac:InvoiceLine>`
- [x] Excel usa impuestos por ítem (matriz dispersa)
- [x] Frontend muestra columna "Impuesto" por producto
- [ ] Migración SQL ejecutada en base de datos
- [ ] Facturas de prueba re-procesadas

---

## 📝 ARCHIVOS MODIFICADOS

### Backend
1. `backend/app/modules/xml/models.py` - Modelo `InvoiceItem`
2. `backend/app/modules/xml/services.py` - Funciones `parse_xml_invoice()` y `export_invoices_to_excel()`
3. `backend/migrations/add_json_taxes_to_items.sql` - Script de migración

### Frontend
4. `frontend/src/components/ui/InvoicePreview.jsx` - Vista de detalle de factura

---

**Estado Final**: ✅ **CORRECCIÓN IMPLEMENTADA - LISTA PARA DEPLOY**

Una vez ejecutes la migración SQL y re-proceses las facturas existentes, el sistema funcionará correctamente.
