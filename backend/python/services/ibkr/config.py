"""IBKR service configuration."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    ib_host: str = Field(default="127.0.0.1", validation_alias="IB_HOST")
    ib_port: int = Field(default=4002, validation_alias="IB_PORT")
    ib_client_id: int = Field(default=1, validation_alias="IB_CLIENT_ID")
    ib_paper: bool = Field(default=True, validation_alias="IB_PAPER")
    ib_account: str = Field(default="", validation_alias="IB_ACCOUNT")

    database_url: str = Field(
        default="postgresql+asyncpg://ibkr:ibkr@postgres:5432/ibkr",
        validation_alias="DATABASE_URL",
    )
    database_url_sync: str = Field(
        default="postgresql+psycopg2://ibkr:ibkr@postgres:5432/ibkr",
        validation_alias="DATABASE_URL_SYNC",
    )

    ibkr_port: int = Field(default=8093, validation_alias="IBKR_PORT")
    ibkr_api_key: str = Field(default="", validation_alias="IBKR_API_KEY")

    default_symbols: str = Field(default="SPY,QQQ,NVDA,AAPL,TSLA,AMD,MSFT,AMZN,META", validation_alias="WS_SYMBOLS")
    ws_batch_ms: int = Field(default=150, validation_alias="WS_BATCH_MS")


settings = Settings()
