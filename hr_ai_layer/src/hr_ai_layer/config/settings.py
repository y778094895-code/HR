from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: str = "dev"
    log_level: str = "INFO"

    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "db_hr"
    db_user: str = "postgres"
    db_password: str = "12345"

    mlflow_tracking_uri: str = "http://localhost:5000"
    mlflow_experiment: str = "attrition_survival_v1"

    model_name: str = "attrition_survival"
    model_version: str = "0.1.0"

    @property
    def sqlalchemy_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

settings = Settings()
