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

def test_get_and_update_profile(client, test_user, second_user):
    # 1. Get current profile
    get_res = client.get("/api/auth/me", headers=test_user["headers"])
    assert get_res.status_code == 200
    profile = get_res.json()
    assert profile["email"] == test_user["email"]
    assert "created_at" in profile

    # 2. Update profile name and email
    update_res = client.put("/api/auth/me", json={
        "name": "Updated Name",
        "email": "updated_alice@spendwise.com"
    }, headers=test_user["headers"])
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["name"] == "Updated Name"
    assert updated["email"] == "updated_alice@spendwise.com"

    # 3. Attempt to update email to an already existing user's email -> 400
    collision_res = client.put("/api/auth/me", json={
        "name": "Updated Name",
        "email": second_user["email"]
    }, headers=test_user["headers"])
    assert collision_res.status_code == 400
    assert "already in use" in collision_res.json()["detail"].lower()

def test_change_password_workflow(client):
    # Register a new user
    client.post("/api/auth/register", json={
        "name": "Password Guy",
        "email": "pwd_test@spendwise.com",
        "password": "InitialPassword123"
    })
    login_res = client.post("/api/auth/login", data={
        "username": "pwd_test@spendwise.com",
        "password": "InitialPassword123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Change password with incorrect current password -> 400
    bad_change = client.post("/api/auth/change-password", json={
        "current_password": "WrongCurrentPassword",
        "new_password": "BrandNewPassword999"
    }, headers=headers)
    assert bad_change.status_code == 400
    assert "incorrect" in bad_change.json()["detail"].lower()

    # 2. Change password with correct current password -> 200
    good_change = client.post("/api/auth/change-password", json={
        "current_password": "InitialPassword123",
        "new_password": "BrandNewPassword999"
    }, headers=headers)
    assert good_change.status_code == 200

    # 3. Old password should now fail login -> 401
    old_login = client.post("/api/auth/login", data={
        "username": "pwd_test@spendwise.com",
        "password": "InitialPassword123"
    })
    assert old_login.status_code == 401

    # 4. New password succeeds login -> 200
    new_login = client.post("/api/auth/login", data={
        "username": "pwd_test@spendwise.com",
        "password": "BrandNewPassword999"
    })
    assert new_login.status_code == 200

def test_delete_account_and_cascade(client):
    # Register user
    client.post("/api/auth/register", json={
        "name": "Doomed User",
        "email": "doomed@spendwise.com",
        "password": "DoomedPassword123"
    })
    login_res = client.post("/api/auth/login", data={
        "username": "doomed@spendwise.com",
        "password": "DoomedPassword123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Seed an expense
    exp_res = client.post("/api/expenses/", json={
        "amount": 42.0,
        "category": "Food",
        "description": "Doomed Lunch",
        "date": "2026-10-10"
    }, headers=headers)
    assert exp_res.status_code == 200

    # Delete account
    del_res = client.delete("/api/auth/me", headers=headers)
    assert del_res.status_code == 200
    assert "deleted" in del_res.json()["message"].lower()

    # Try to login again -> 401
    after_login = client.post("/api/auth/login", data={
        "username": "doomed@spendwise.com",
        "password": "DoomedPassword123"
    })
    assert after_login.status_code == 401

