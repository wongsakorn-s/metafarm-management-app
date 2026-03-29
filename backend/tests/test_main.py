import logging


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

    assert response.status_code == 404
    assert "http_error" in caplog.text
    assert "path=/api/hives/UNKNOWN-HIVE" in caplog.text
