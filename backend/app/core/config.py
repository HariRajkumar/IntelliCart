from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "IntelliCart API"
    APP_VERSION: str = "1.0.0"

    MONGO_URL: str
    DATABASE_NAME: str

    JWT_SECRET: str

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()