from abc import ABC, abstractmethod
from typing import List
from src.domain.entities import Factura

class ParserFiscal(ABC):
    @abstractmethod
    def parse(self, content: bytes) -> Factura:
        """Parsea bytes de una factura (XML, JSON, etc) a una Entidad Factura."""
        pass
