from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GROQ_API_KEY: str
    MODEL_NAME: str = "llama-3.1-8b-instant"
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ecommerce_db"
    JWT_SECRET: str
    PORT: int = 8002

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
