def test_create_and_get_goal(client, test_user):
    payload = {
        "title": "Emergency Fund",
        "target_amount": 100000.0,
        "current_amount": 25000.0,
        "target_date": "2026-12-31"
    }
    res = client.post("/api/goals/", json=payload, headers=test_user["headers"])
    assert res.status_code == 201
    created = res.json()
    assert created["title"] == "Emergency Fund"
    assert created["target_amount"] == 100000.0
    assert created["current_amount"] == 25000.0
    assert created["target_date"] == "2026-12-31"
    goal_id = created["id"]

    # List all goals
    list_res = client.get("/api/goals/", headers=test_user["headers"])
    assert list_res.status_code == 200
    assert any(g["id"] == goal_id for g in list_res.json())

    # Get single goal
    single_res = client.get(f"/api/goals/{goal_id}", headers=test_user["headers"])
    assert single_res.status_code == 200
    assert single_res.json()["id"] == goal_id

def test_update_goal_progress(client, test_user):
    create_res = client.post("/api/goals/", json={
        "title": "New Laptop",
        "target_amount": 80000.0,
        "current_amount": 10000.0,
        "target_date": "2026-11-30"
    }, headers=test_user["headers"])
    goal_id = create_res.json()["id"]

    # Deposit additional funds towards goal
    update_res = client.put(f"/api/goals/{goal_id}", json={
        "current_amount": 40000.0
    }, headers=test_user["headers"])
    assert update_res.status_code == 200
    assert update_res.json()["current_amount"] == 40000.0
    assert update_res.json()["title"] == "New Laptop"

def test_delete_goal(client, test_user):
    create_res = client.post("/api/goals/", json={
        "title": "Vacation",
        "target_amount": 50000.0,
        "current_amount": 0.0
    }, headers=test_user["headers"])
    goal_id = create_res.json()["id"]

    del_res = client.delete(f"/api/goals/{goal_id}", headers=test_user["headers"])
    assert del_res.status_code == 200

    get_res = client.get(f"/api/goals/{goal_id}", headers=test_user["headers"])
    assert get_res.status_code == 404

def test_goal_validation_rejected(client, test_user):
    # Negative target_amount
    res = client.post("/api/goals/", json={
        "title": "Invalid Target",
        "target_amount": -5000.0
    }, headers=test_user["headers"])
    assert res.status_code == 422

    # Negative current_amount
    res2 = client.post("/api/goals/", json={
        "title": "Negative Deposit",
        "target_amount": 5000.0,
        "current_amount": -100.0
    }, headers=test_user["headers"])
    assert res2.status_code == 422

def test_multi_tenant_goal_isolation(client, test_user, second_user):
    create_res = client.post("/api/goals/", json={
        "title": "Private Wealth",
        "target_amount": 500000.0,
        "current_amount": 100000.0
    }, headers=test_user["headers"])
    goal_id = create_res.json()["id"]

    # second_user should not see it
    user2_list = client.get("/api/goals/", headers=second_user["headers"]).json()
    assert not any(g["id"] == goal_id for g in user2_list)

    # second_user cannot access or modify it
    assert client.get(f"/api/goals/{goal_id}", headers=second_user["headers"]).status_code == 404
    assert client.delete(f"/api/goals/{goal_id}", headers=second_user["headers"]).status_code == 404
