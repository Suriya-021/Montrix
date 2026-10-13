def test_create_and_get_subscription(client, test_user):
    payload = {
        "title": "Netflix Premium",
        "amount": 649.0,
        "frequency": "Monthly",
        "next_due_date": "2026-10-25"
    }
    res = client.post("/api/subscriptions/", json=payload, headers=test_user["headers"])
    assert res.status_code == 201
    created = res.json()
    assert created["title"] == "Netflix Premium"
    assert created["amount"] == 649.0
    assert created["frequency"] == "Monthly"
    assert created["next_due_date"] == "2026-10-25"
    sub_id = created["id"]

    # List subscriptions
    list_res = client.get("/api/subscriptions/", headers=test_user["headers"])
    assert list_res.status_code == 200
    assert any(s["id"] == sub_id for s in list_res.json())

    # Get single subscription
    single_res = client.get(f"/api/subscriptions/{sub_id}", headers=test_user["headers"])
    assert single_res.status_code == 200
    assert single_res.json()["id"] == sub_id

def test_update_subscription(client, test_user):
    create_res = client.post("/api/subscriptions/", json={
        "title": "Spotify Family",
        "amount": 179.0,
        "frequency": "Monthly",
        "next_due_date": "2026-11-01"
    }, headers=test_user["headers"])
    sub_id = create_res.json()["id"]

    # Update price and next_due_date
    update_res = client.put(f"/api/subscriptions/{sub_id}", json={
        "amount": 199.0,
        "next_due_date": "2026-12-01"
    }, headers=test_user["headers"])
    assert update_res.status_code == 200
    assert update_res.json()["amount"] == 199.0
    assert update_res.json()["next_due_date"] == "2026-12-01"

def test_delete_subscription(client, test_user):
    create_res = client.post("/api/subscriptions/", json={
        "title": "Gym Membership",
        "amount": 2000.0,
        "frequency": "Monthly",
        "next_due_date": "2026-10-30"
    }, headers=test_user["headers"])
    sub_id = create_res.json()["id"]

    del_res = client.delete(f"/api/subscriptions/{sub_id}", headers=test_user["headers"])
    assert del_res.status_code == 200

    get_res = client.get(f"/api/subscriptions/{sub_id}", headers=test_user["headers"])
    assert get_res.status_code == 404

def test_subscription_validation_rejected(client, test_user):
    # Negative amount
    res = client.post("/api/subscriptions/", json={
        "title": "Invalid Sub",
        "amount": -50.0,
        "frequency": "Monthly",
        "next_due_date": "2026-10-25"
    }, headers=test_user["headers"])
    assert res.status_code == 422

    # Zero amount
    res_zero = client.post("/api/subscriptions/", json={
        "title": "Invalid Zero Sub",
        "amount": 0.0,
        "frequency": "Monthly",
        "next_due_date": "2026-10-25"
    }, headers=test_user["headers"])
    assert res_zero.status_code == 422

def test_multi_tenant_subscription_isolation(client, test_user, second_user):
    create_res = client.post("/api/subscriptions/", json={
        "title": "Private Cloud Server",
        "amount": 4500.0,
        "frequency": "Monthly",
        "next_due_date": "2026-11-15"
    }, headers=test_user["headers"])
    sub_id = create_res.json()["id"]

    # second_user cannot see it
    user2_list = client.get("/api/subscriptions/", headers=second_user["headers"]).json()
    assert not any(s["id"] == sub_id for s in user2_list)

    # second_user cannot access or delete it
    assert client.get(f"/api/subscriptions/{sub_id}", headers=second_user["headers"]).status_code == 404
    assert client.delete(f"/api/subscriptions/{sub_id}", headers=second_user["headers"]).status_code == 404
