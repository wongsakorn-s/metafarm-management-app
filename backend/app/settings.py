from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_DIR = BACKEND_DIR.parent


def read_secret_file(path_value: str | None) -> str | None:
    if not path_value:
        return None
    path = Path(path_value)
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8").strip()


def read_secret(raw_value: str | None, file_value: str | None, default: str | None = None) -> str | None:
    if raw_value:
        return raw_value
    file_secret = read_secret_file(file_value)
    if file_secret:
        return file_secret
    return default


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPO_DIR / ".env", BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Stingless Bee Hive Management API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    api_prefix: str = "/api"
    database_url_raw: str | None = Field(default=None, alias="DATABASE_URL")
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=5433, alias="DB_PORT")
    db_name: str = Field(default="metafarm_db", alias="DB_NAME")
    db_user: str = Field(default="metafarm_user", alias="DB_USER")
    db_password_raw: str | None = Field(default=None, alias="DB_PASSWORD")
    db_password_file: str | None = Field(default=None, alias="DB_PASSWORD_FILE")
    cors_origins_raw: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="CORS_ORIGINS",
    )
    cors_origin_regex: str | None = Field(default=None, alias="CORS_ORIGIN_REGEX")
    openweather_api_key_raw: str | None = Field(default=None, alias="OPENWEATHER_API_KEY")
    openweather_api_key_file: str | None = Field(default=None, alias="OPENWEATHER_API_KEY_FILE")
    supabase_url: str | None = Field(default=None, alias="SUPABASE_URL")
    supabase_storage_bucket: str | None = Field(default=None, alias="SUPABASE_STORAGE_BUCKET")
    supabase_service_role_key_raw: str | None = Field(default=None, alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_service_role_key_file: str | None = Field(default=None, alias="SUPABASE_SERVICE_ROLE_KEY_FILE")
    admin_username: str = Field(default="admin", alias="ADMIN_USERNAME")
    admin_password_raw: str | None = Field(default=None, alias="ADMIN_PASSWORD")
    admin_password_file: str | None = Field(default=None, alias="ADMIN_PASSWORD_FILE")
    jwt_secret_key_raw: str | None = Field(default=None, alias="JWT_SECRET_KEY")
    jwt_secret_key_file: str | None = Field(default=None, alias="JWT_SECRET_KEY_FILE")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=480, alias="JWT_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=14, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    refresh_cookie_name: str = Field(default="metafarm_refresh_token", alias="REFRESH_COOKIE_NAME")
    refresh_cookie_secure: bool = Field(default=False, alias="REFRESH_COOKIE_SECURE")
    refresh_cookie_samesite: str = Field(default="lax", alias="REFRESH_COOKIE_SAMESITE")
    weather_cache_ttl_seconds: int = Field(default=300, alias="WEATHER_CACHE_TTL_SECONDS")
    auth_rate_limit_requests: int = Field(default=10, alias="AUTH_RATE_LIMIT_REQUESTS")
    auth_rate_limit_window_seconds: int = Field(default=60, alias="AUTH_RATE_LIMIT_WINDOW_SECONDS")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    farm_lat: str = Field(default="13.310314", alias="FARM_LAT")
    farm_lon: str = Field(default="101.111504", alias="FARM_LON")
    farm_location_name_th: str = Field(default="พื้นที่ฟาร์ม", alias="FARM_LOCATION_NAME_TH")
    static_dir: Path = BACKEND_DIR / "static"
    upload_dir: Path = BACKEND_DIR / "static" / "uploads"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]

    @property
    def database_url(self) -> str:
        if self.database_url_raw:
            return self.database_url_raw
        password = read_secret(self.db_password_raw, self.db_password_file, "metafarm_password")
        return (
            f"postgresql://{quote_plus(self.db_user)}:{quote_plus(password or '')}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def openweather_api_key(self) -> str | None:
        return read_secret(self.openweather_api_key_raw, self.openweather_api_key_file)

    @property
    def supabase_service_role_key(self) -> str | None:
        return read_secret(self.supabase_service_role_key_raw, self.supabase_service_role_key_file)

    @property
    def supabase_storage_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_storage_bucket and self.supabase_service_role_key)

    @property
    def admin_password(self) -> str:
        return read_secret(self.admin_password_raw, self.admin_password_file, "changeme123") or "changeme123"

    @property
    def jwt_secret_key(self) -> str:
        return (
            read_secret(
                self.jwt_secret_key_raw,
                self.jwt_secret_key_file,
                "change_me_jwt_secret_key_with_at_least_32_bytes",
            )
            or "change_me_jwt_secret_key_with_at_least_32_bytes"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
