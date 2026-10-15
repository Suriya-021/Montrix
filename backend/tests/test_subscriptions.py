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

def test_pay_subscription_and_advance_cycle(client, test_user):
    # 1. Create a subscription
    create_res = client.post("/api/subscriptions/", json={
        "title": "Disney+ Hotstar",
        "amount": 299.0,
        "frequency": "Monthly",
        "next_due_date": "2026-10-15"
    }, headers=test_user["headers"])
    assert create_res.status_code == 201
    sub_id = create_res.json()["id"]

    # 2. Pay subscription (One-click log to expense)
    pay_res = client.post(f"/api/subscriptions/{sub_id}/pay", headers=test_user["headers"])
    assert pay_res.status_code == 200
    pay_data = pay_res.json()
    assert pay_data["new_due_date"] == "2026-11-15"
    expense_id = pay_data["expense_id"]

    # 3. Check the logged expense in expenses list
    exp_res = client.get(f"/api/expenses/{expense_id}", headers=test_user["headers"])
    assert exp_res.status_code == 200
    exp = exp_res.json()
    assert exp["amount"] == 299.0
    assert exp["category"] == "Bills"
    assert "Disney+ Hotstar" in exp["description"]

def test_due_subscriptions_and_batch_processing(client, test_user):
    # 1. Create an overdue subscription
    create_res = client.post("/api/subscriptions/", json={
        "title": "AWS Cloud Hosting",
        "amount": 1250.0,
        "frequency": "Monthly",
        "next_due_date": "2026-01-01"
    }, headers=test_user["headers"])
    assert create_res.status_code == 201

    # 2. Query due subscriptions
    due_res = client.get("/api/subscriptions/due", headers=test_user["headers"])
    assert due_res.status_code == 200
    due_list = due_res.json()
    assert any(s["title"] == "AWS Cloud Hosting" for s in due_list)

    # 3. Batch process due subscriptions
    process_res = client.post("/api/subscriptions/process-due", headers=test_user["headers"])
    assert process_res.status_code == 200
    result = process_res.json()
    assert result["processed_count"] >= 1
    assert result["total_amount"] >= 1250.0

def test_system_auto_rollover_engine(client, test_user):
    from app.database.subscription_db import process_system_due_subscriptions
    # Create an overdue subscription
    create_res = client.post("/api/subscriptions/", json={
        "title": "Google One Storage",
        "amount": 130.0,
        "frequency": "Monthly",
        "next_due_date": "2026-01-01"
    }, headers=test_user["headers"])
    assert create_res.status_code == 201

    count = process_system_due_subscriptions()
    assert count >= 1

