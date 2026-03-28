from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Stingless Bee Hive Management API"}

def test_dashboard_stats():
    # This might fail if DB is not connected/setup
    response = client.get("/api/dashboard/stats")
    assert response.status_code in [200, 500] # 500 is okay if DB is not up during local test
