from pydantic import BaseModel, Field, field_validator
from decimal import Decimal
from typing import List, Optional
from datetime import date

class FacturaItemInputDTO(BaseModel):
    descripcion: str
    cantidad: Decimal = Field(..., gt=0)
    precio_unitario: Decimal = Field(..., gt=0)
    currency: str = "COP"
    tasa_impuesto: Decimal = Field(..., ge=0, le=1)

class FacturaInputDTO(BaseModel):
    """DTO para entrada manual de facturas (si fuera necesario explícitamente)
    o representación plana."""
    fecha_emision: Optional[date] = None
    items: List[FacturaItemInputDTO]

class ReporteDTO(BaseModel):
    factura_id: str
    total_bruto: Decimal
    total_impuestos: Decimal
    total_neto: Decimal
    currency: str

class ReporteOutputDTO(BaseModel):
    reportes: List[ReporteDTO]
    total_general_neto: Decimal
