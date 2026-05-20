from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ai-code-kb-platform"
    environment: str = "dev"
    database_url: str = "postgresql+asyncpg://sunweini@localhost:5432/aiwiki"
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_recycle_seconds: int = 3600
    db_pool_pre_ping: bool = True
    deepseek_api_key: str = "sk-cb705a0913c2467186f9447bf2c5354a"
    redis_url: str = "redis://localhost:6379/0"
    data_root: str = str(Path(__file__).resolve().parent.parent.parent / "data")

    model_config = SettingsConfigDict(env_prefix="AIKB_", extra="ignore")


settings = Settings()
