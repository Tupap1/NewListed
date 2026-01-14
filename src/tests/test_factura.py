import pytest
from decimal import Decimal
from src.domain.value_objects import Moneda
from src.domain.entities import Factura, ItemFactura

def test_calcular_impuestos():
    # Arrange
    factura = Factura()
    
    item1 = ItemFactura(
        descripcion="Mouse",
        cantidad=Decimal("1"),
        precio_unitario=Moneda(Decimal("100.00"), "COP"),
        tasa_impuesto=Decimal("0.19")
    )
    
    item2 = ItemFactura(
        descripcion="Teclado",
        cantidad=Decimal("2"),
        precio_unitario=Moneda(Decimal("200.00"), "COP"),
        tasa_impuesto=Decimal("0.10")
    )
    
    factura.agregar_item(item1)
    factura.agregar_item(item2)
    
    # Act
    impuestos = factura.calcular_impuestos()
    
    # Assert
    # Item 1: 100 * 1 * 0.19 = 19.00
    # Item 2: 200 * 2 * 0.10 = 40.00
    # Total: 59.00
    
    assert impuestos.amount == Decimal("59.00")
    assert impuestos.currency == "COP"
    assert factura.total_bruto.amount == Decimal("500.00") # 100 + 400
    assert factura.total_neto.amount == Decimal("559.00") # 500 + 59
