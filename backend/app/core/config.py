from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "IntelliCart API"
    APP_VERSION: str = "1.0.0"

    MONGODB_URL: str
    DATABASE_NAME: str

    JWT_SECRET_KEY: str

    JWT_ALGORITHM: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()