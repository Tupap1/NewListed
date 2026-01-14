from sqlalchemy import Column, String, Date, Numeric, Integer, ForeignKey
from sqlalchemy.orm import relationship, DeclarativeBase

class Base(DeclarativeBase):
    pass

class FacturaModel(Base):
    __tablename__ = "facturas"

    id = Column(String, primary_key=True)
    fecha_emision = Column(Date, nullable=False)
    # Storing currency for consistency, though items have it.
    currency = Column(String, default="COP") 
    
    items = relationship("ItemFacturaModel", back_populates="factura", cascade="all, delete-orphan")

class ItemFacturaModel(Base):
    __tablename__ = "factura_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    factura_id = Column(String, ForeignKey("facturas.id"))
    descripcion = Column(String, nullable=False)
    cantidad = Column(Numeric(10, 2), nullable=False)
    precio_unitario = Column(Numeric(20, 2), nullable=False)
    currency = Column(String, default="COP")
    tasa_impuesto = Column(Numeric(5, 4), nullable=False) # e.g. 0.1900

    factura = relationship("FacturaModel", back_populates="items")
