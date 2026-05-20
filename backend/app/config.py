from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ai-code-kb-platform"
    environment: str = "dev"
    database_url: str = "sqlite+pysqlite:///./data/aiwiki.db"
    redis_url: str = "redis://localhost:6379/0"
    data_root: str = str(Path(__file__).resolve().parent.parent.parent / "data")

    model_config = SettingsConfigDict(env_prefix="AIKB_", extra="ignore")


settings = Settings()
