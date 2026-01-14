from abc import ABC, abstractmethod
from typing import Optional
from src.domain.entities import Factura

class FacturaRepository(ABC):
    
    @abstractmethod
    def save(self, factura: Factura) -> None:
        """Guarda una factura en el repositorio."""
        pass

    @abstractmethod
    def find_by_id(self, factura_id: str) -> Optional[Factura]:
        """Busca una factura por su ID."""
        pass
