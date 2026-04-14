import logging

from app import auth, database, models


def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Stingless Bee Hive Management API"}


def test_live_healthcheck(client):
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_healthcheck(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "metafarm_http_requests_total" in response.text
    assert "text/plain" in response.headers["content-type"]


def test_login_success_returns_jwt(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "metafarm_admin_2026"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["expires_in_seconds"] == 28800
    assert body["refresh_expires_in_seconds"] == 1209600
    assert response.cookies.get("metafarm_refresh_token")


def test_login_rejects_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_refresh_rotates_tokens(client, auth_session):
    original_refresh_cookie = auth_session["refresh_cookie"]
    response = client.post("/api/auth/refresh")

    assert response.status_code == 200
    refreshed = response.json()
    assert refreshed["access_token"] != auth_session["access_token"]
    refreshed_cookie = response.cookies.get("metafarm_refresh_token")
    assert refreshed_cookie
    assert refreshed_cookie != original_refresh_cookie

    client.cookies.set("metafarm_refresh_token", original_refresh_cookie)
    second_use = client.post("/api/auth/refresh")
    assert second_use.status_code == 401


def test_logout_revokes_refresh_token(client, auth_session):
    original_refresh_cookie = auth_session["refresh_cookie"]
    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200

    client.cookies.set("metafarm_refresh_token", original_refresh_cookie)
    refresh_response = client.post("/api/auth/refresh")
    assert refresh_response.status_code == 401


def test_protected_write_requires_jwt(client):
    response = client.post(
        "/api/hives/",
        json={
            "hive_id": "AUTH-TEST-1",
            "name": "Protected Hive",
            "species": "Tetragonula",
            "location": "Zone A",
            "status": "Normal",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Missing bearer token"


def test_login_can_access_protected_write(client, auth_headers):
    response = client.post(
        "/api/hives/",
        headers=auth_headers,
        json={
            "hive_id": "AUTH-TEST-2",
            "name": "Protected Hive",
            "species": "Tetragonula",
            "location": "Zone A",
            "status": "Normal",
        },
    )

    assert response.status_code == 200
    assert response.json()["hive_id"] == "AUTH-TEST-2"


def test_invalid_hive_id_returns_422(client, auth_headers):
    response = client.post(
        "/api/hives/",
        headers=auth_headers,
        json={
            "hive_id": "bad id",
            "name": "Invalid Hive",
            "species": "Tetragonula",
            "location": "Zone A",
            "status": "Normal",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"]


def test_negative_harvest_is_rejected(client, auth_headers, seeded_hive):
    response = client.post(
        f"/api/harvests/?hive_id_int={seeded_hive['id']}",
        headers=auth_headers,
        json={
            "honey_yield_ml": -1,
            "propolis_yield_g": 1,
        },
    )

    assert response.status_code == 422


def test_logging_records_completed_requests(client, caplog):
    with caplog.at_level(logging.INFO):
        response = client.get("/health/live")

    assert response.status_code == 200
    assert "request_completed" in caplog.text
    assert "path=/health/live" in caplog.text


def test_logging_records_http_errors(client, caplog):
    with caplog.at_level(logging.WARNING):
        response = client.get("/api/hives/UNKNOWN-HIVE")

    assert response.status_code == 401
    assert "http_error" in caplog.text
    assert "path=/api/hives/UNKNOWN-HIVE" in caplog.text


def test_invalid_inspection_image_does_not_create_record(client, auth_headers, seeded_hive):
    before_session = database.SessionLocal()
    try:
        before_count = before_session.query(models.InspectionRecord).count()
    finally:
        before_session.close()
    response = client.post(
        "/api/inspections/",
        headers=auth_headers,
        files={"image": ("invalid.txt", b"not-an-image", "text/plain")},
        data={"hive_id_int": str(seeded_hive["id"]), "notes": "bad upload"},
    )

    after_session = database.SessionLocal()
    try:
        after_count = after_session.query(models.InspectionRecord).count()
    finally:
        after_session.close()

    assert response.status_code == 400
    assert after_count == before_count


def test_viewer_can_read_hive_inspections(client, seeded_hive):
    db = database.SessionLocal()
    try:
        viewer = models.User(
            username="viewer_user",
            password_hash=auth.hash_password("viewer_pass_2026"),
            full_name="Viewer User",
            role=models.UserRole.VIEWER,
            is_active=True,
        )
        db.add(viewer)
        db.flush()
        db.add(
            models.InspectionRecord(
                hive_id=seeded_hive["id"],
                notes="viewer-readable",
                hive_status=models.HiveStatus.NORMAL,
            )
        )
        db.commit()
    finally:
        db.close()

    login_response = client.post(
        "/api/auth/login",
        json={"username": "viewer_user", "password": "viewer_pass_2026"},
    )
    access_token = login_response.json()["access_token"]
    response = client.get(
        f"/api/inspections/hive/{seeded_hive['id']}",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json()[0]["notes"] == "viewer-readable"
