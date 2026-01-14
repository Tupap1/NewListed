from abc import ABC, abstractmethod
from typing import List
from src.application.dtos import ReporteOutputDTO

class ProcesarFacturasUseCase(ABC):
    @abstractmethod
    def execute(self, archivos_xml: List[bytes]) -> None:
        pass

class GenerarReporteContableUseCase(ABC):
    @abstractmethod
    def execute(self) -> ReporteOutputDTO:
        pass
