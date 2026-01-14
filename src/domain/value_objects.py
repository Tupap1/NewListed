from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Any
from src.domain.exceptions import MonedaIncompatibleError

@dataclass(frozen=True)
class Moneda:
    amount: Decimal
    currency: str = "COP"

    def __post_init__(self):
        # validation could go here, e.g. amount scale
        pass

    def __add__(self, other: 'Moneda') -> 'Moneda':
        if not isinstance(other, Moneda):
            return NotImplemented
        if self.currency != other.currency:
            raise MonedaIncompatibleError(f"Cannot add {self.currency} and {other.currency}")
        return Moneda(self.amount + other.amount, self.currency)

    def __sub__(self, other: 'Moneda') -> 'Moneda':
        if not isinstance(other, Moneda):
            return NotImplemented
        if self.currency != other.currency:
            raise MonedaIncompatibleError(f"Cannot subtract {self.currency} and {other.currency}")
        return Moneda(self.amount - other.amount, self.currency)

    def __mul__(self, other: Any) -> 'Moneda':
        if isinstance(other, (int, float, Decimal)):
            return Moneda(self.amount * Decimal(str(other)), self.currency)
        return NotImplemented

    def round(self, decimals: int = 2) -> 'Moneda':
        return Moneda(self.amount.quantize(Decimal(f'1.{"0" * decimals}'), rounding=ROUND_HALF_UP), self.currency)

    def __lt__(self, other: 'Moneda') -> bool:
        if self.currency != other.currency:
             raise MonedaIncompatibleError(f"Cannot compare {self.currency} and {other.currency}")
        return self.amount < other.amount

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Moneda):
            return False
        return self.amount == other.amount and self.currency == other.currency
