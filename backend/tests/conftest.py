import os
import sys

# Ensure test DB and secret key are configured BEFORE app imports
TEST_DB_FILE = "test_suite.db"
os.environ["DATABASE_URL"] = f"sqlite:///./{TEST_DB_FILE}"
os.environ["SECRET_KEY"] = "test_secret_key_for_unit_tests"

import pytest
from fastapi.testclient import TestClient
from app.main import app as fastapi_app
from app.database_orm import engine, Base
import app.models.all_models

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initializes a clean isolated database for the entire test session."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

@pytest.fixture
def client():
    """Provides a FastAPI TestClient."""
    with TestClient(fastapi_app) as c:
        yield c

@pytest.fixture
def test_user(client):
    """Registers and logs in a primary test user, returning auth headers."""
    email = "primary_tester@spendwise.com"
    password = "SecurePassword123"
    
    # Attempt registration (ignore if already registered)
    client.post("/api/auth/register", json={
        "name": "Primary Tester",
        "email": email,
        "password": password
    })

    login_res = client.post("/api/auth/login", data={
        "username": email,
        "password": password
    })
    
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    
    return {
        "email": email,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }

@pytest.fixture
def second_user(client):
    """Registers and logs in a second user for multi-tenancy isolation testing."""
    email = "tenant_two@spendwise.com"
    password = "DifferentPassword456"
    
    client.post("/api/auth/register", json={
        "name": "Second Tenant",
        "email": email,
        "password": password
    })

    login_res = client.post("/api/auth/login", data={
        "username": email,
        "password": password
    })
    
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    
    return {
        "email": email,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }
