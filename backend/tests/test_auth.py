def test_register_new_user(client):
    res = client.post("/api/auth/register", json={
        "name": "Alice Green",
        "email": "alice_unique@spendwise.com",
        "password": "Password789"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "alice_unique@spendwise.com"
    assert "id" in data

def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "name": "Bob Duplicate",
        "email": "bob_dup@spendwise.com",
        "password": "Password789"
    })
    res = client.post("/api/auth/register", json={
        "name": "Bob Duplicate 2",
        "email": "bob_dup@spendwise.com",
        "password": "Password789"
    })
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"].lower()

def test_login_success(client):
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login_test@spendwise.com",
        "password": "CorrectPassword123"
    })
    res = client.post("/api/auth/login", data={
        "username": "login_test@spendwise.com",
        "password": "CorrectPassword123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"

def test_login_invalid_password(client):
    res = client.post("/api/auth/login", data={
        "username": "login_test@spendwise.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401

def test_unauthorized_access_rejected(client):
    res = client.get("/api/expenses/")
    assert res.status_code == 401

def test_invalid_token_rejected(client):
    res = client.get("/api/expenses/", headers={"Authorization": "Bearer invalid_gibberish_token"})
    assert res.status_code == 401
