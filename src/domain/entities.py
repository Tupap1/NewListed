from dataclasses import dataclass, field
from typing import List, Optional
from datetime import date
from decimal import Decimal
import uuid

from src.domain.value_objects import Moneda
from src.domain.exceptions import IvaInconsistenteError

@dataclass
class ItemFactura:
    descripcion: str
    cantidad: Decimal
    precio_unitario: Moneda
    tasa_impuesto: Decimal  # e.g., 0.19 for 19%

    @property
    def subtotal(self) -> Moneda:
        return self.precio_unitario * self.cantidad
    
    @property
    def impuesto(self) -> Moneda:
        return self.subtotal * self.tasa_impuesto

@dataclass
class Factura:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    fecha_emision: date = field(default_factory=date.today)
    items: List[ItemFactura] = field(default_factory=list)
    
    # These could be calculated or stored. 
    # For a domain entity that represents business state, usually we enforce invariants.
    # We'll calculate them on demand or update them via methods.
    
    def agregar_item(self, item: ItemFactura):
        if self.items and item.precio_unitario.currency != self.items[0].precio_unitario.currency:
             # Simplification: All items must have same currency
             raise ValueError("Currency mismatch in items")
        self.items.append(item)

    def calcular_impuestos(self) -> Moneda:
        """
        Calcula el total de impuestos de la factura sumando el impuesto de cada ítem.
        Retorna un objeto Moneda.
        """
        if not self.items:
            return Moneda(Decimal("0.00"))
            
        currency = self.items[0].precio_unitario.currency
        total_impuesto = Moneda(Decimal("0.00"), currency)
        
        for item in self.items:
            total_impuesto += item.impuesto
            
        # Example validation rule: 
        # If we had a pre-calculated explicit tax value to check against, we would do it here.
        # Since we are calculating it, we return it.
        # But if the user wanted validation logic (e.g. from an imported XML where total is stated),
        # we might pass an expected_tax argument. 
        # For now, I'll just calculate it as requested.
        
        return total_impuesto.round(2)

    @property
    def total_bruto(self) -> Moneda:
        if not self.items:
            return Moneda(Decimal("0.00"))
        currency = self.items[0].precio_unitario.currency
        return sum([item.subtotal for item in self.items], Moneda(Decimal("0.00"), currency)).round(2)

    @property
    def total_neto(self) -> Moneda:
        return (self.total_bruto + self.calcular_impuestos()).round(2)
    
    def validar_totales(self, esperado_impuesto: Moneda):
        """
        Ejemplo de regla de negocio: Verificar que el impuesto calculado coincida con el esperado
        (útil al importar facturas).
        """
        calculado = self.calcular_impuestos()
        # Allow small difference for rounding
        diff = abs(calculado.amount - esperado_impuesto.amount)
        if diff > Decimal("0.05"): # Tolerance
            raise IvaInconsistenteError(
                f"Impuesto calculado ({calculado.amount}) difiere del esperado ({esperado_impuesto.amount})"
            )
