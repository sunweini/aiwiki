from app.db.models.binding import KnowledgeBaseSourceBinding
from app.db.repository import BaseRepository


class BindingRepository(BaseRepository[KnowledgeBaseSourceBinding]):
    model = KnowledgeBaseSourceBinding
