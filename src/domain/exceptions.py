class DomainError(Exception):
    """Base exception for domain errors."""
    pass

class IvaInconsistenteError(DomainError):
    """Raised when the calculated IVA does not match expected rules or values."""
    pass

class MonedaIncompatibleError(DomainError):
    """Raised when trying to operate with different currencies."""
    pass
