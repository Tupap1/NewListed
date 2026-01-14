from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from src.domain.entities import Factura, ItemFactura
from src.domain.value_objects import Moneda
from src.domain.repositories import FacturaRepository
from src.infrastructure.db.models import Base, FacturaModel, ItemFacturaModel
from decimal import Decimal

# Setup database engine (could be moved to config)
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

class SqliteFacturaRepository(FacturaRepository):
    def __init__(self, session: Session = None):
        if session:
            self.session = session
        else:
            self.session = SessionLocal()

    def _to_model(self, entity: Factura) -> FacturaModel:
        """Mapper: Domain Entity -> DB Model"""
        items_models = []
        for item in entity.items:
            items_models.append(ItemFacturaModel(
                descripcion=item.descripcion,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario.amount,
                currency=item.precio_unitario.currency,
                tasa_impuesto=item.tasa_impuesto
            ))
        
        return FacturaModel(
            id=entity.id,
            fecha_emision=entity.fecha_emision,
            currency=entity.items[0].precio_unitario.currency if entity.items else "COP",
            items=items_models
        )

    def _to_entity(self, model: FacturaModel) -> Factura:
        """Mapper: DB Model -> Domain Entity"""
        domain_items = []
        for i in model.items:
            domain_items.append(ItemFactura(
                descripcion=i.descripcion,
                cantidad=Decimal(str(i.cantidad)),
                precio_unitario=Moneda(Decimal(str(i.precio_unitario)), i.currency),
                tasa_impuesto=Decimal(str(i.tasa_impuesto))
            ))
        
        return Factura(
            id=model.id,
            fecha_emision=model.fecha_emision,
            items=domain_items
        )

    def save(self, factura: Factura) -> None:
        model = self._to_model(factura)
        try:
            # Check if exists to update or insert? Protocol assumes new for import usually,
            # but 'save' implies upsert or add. 
            # Simple implementation: merge
            self.session.merge(model)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise e

    def find_by_id(self, factura_id: str) -> Optional[Factura]:
        model = self.session.query(FacturaModel).filter(FacturaModel.id == factura_id).first()
        if model:
            return self._to_entity(model)
        return None
