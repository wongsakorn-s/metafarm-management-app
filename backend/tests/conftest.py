from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DB_PATH = Path(__file__).resolve().parent / "test_suite.sqlite3"

os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH.as_posix()}")
os.environ.setdefault("ADMIN_USERNAME", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "metafarm_admin_2026")
os.environ.setdefault("JWT_SECRET_KEY", "ci_test_secret_key_for_metafarm_suite_2026")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("JWT_EXPIRE_MINUTES", "480")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "14")

from app import database, models
from app.auth import hash_password
from app.main import app

def override_get_db() -> Generator:
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None, None, None]:
    models.Base.metadata.drop_all(bind=database.engine)
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    db.add(
        models.User(
            username="admin",
            password_hash=hash_password("metafarm_admin_2026"),
            full_name="Test Admin",
            role=models.UserRole.ADMIN,
            is_active=True,
        )
    )
    db.commit()
    db.close()
    app.dependency_overrides[database.get_db] = override_get_db
    try:
        yield
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_session(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "metafarm_admin_2026"},
    )
    payload = response.json()
    payload["refresh_cookie"] = response.cookies.get("metafarm_refresh_token")
    return payload


@pytest.fixture
def auth_headers(auth_session: dict[str, str]) -> dict[str, str]:
    return {"Authorization": f"Bearer {auth_session['access_token']}"}


@pytest.fixture
def seeded_hive() -> dict[str, int | str]:
    db = database.SessionLocal()
    try:
        hive = models.Hive(
            hive_id="HIVE-SEED-001",
            name="Seed Hive",
            species="Tetragonula",
            location="Test Zone",
            status=models.HiveStatus.NORMAL,
        )
        db.add(hive)
        db.commit()
        db.refresh(hive)
        return {"id": hive.id, "hive_id": hive.hive_id}
    finally:
        db.close()
