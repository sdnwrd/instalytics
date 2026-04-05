from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    internal_secret: str
    session_encryption_key: str  # base64-encoded 32 bytes
    proxy_base_url: str = "https://ig-proxy.instalytics.app"
    app_base_url: str = "https://instalytics.app"


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
