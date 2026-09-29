"""SQLAlchemy models.

Importing this package registers every model with ``Base.metadata``, which is
what Alembic autogenerate and ``create_all`` inspect. Models are deliberately
*not* imported inside ``app.db.base`` so that layer stays import-cycle free.
"""

from app.db.base import Base
from app.models.persona import Persona

__all__ = ["Base", "Persona"]

