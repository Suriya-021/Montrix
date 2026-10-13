def test_create_and_get_budget(client, test_user):
    payload = {
        "category": "Food",
        "limit_amount": 15000.0,
        "month": "2026-10"
    }
    res = client.post("/api/budgets/", json=payload, headers=test_user["headers"])
    assert res.status_code == 201
    created = res.json()
    assert created["category"] == "Food"
    assert created["limit_amount"] == 15000.0
    assert created["month"] == "2026-10"
    budget_id = created["id"]

    # Get all budgets
    list_res = client.get("/api/budgets/", headers=test_user["headers"])
    assert list_res.status_code == 200
    assert any(b["id"] == budget_id for b in list_res.json())

    # Get single budget
    single_res = client.get(f"/api/budgets/{budget_id}", headers=test_user["headers"])
    assert single_res.status_code == 200
    assert single_res.json()["id"] == budget_id

def test_budget_upsert(client, test_user):
    # Initial budget
    payload1 = {
        "category": "Transport",
        "limit_amount": 5000.0,
        "month": "2026-10"
    }
    res1 = client.post("/api/budgets/", json=payload1, headers=test_user["headers"])
    assert res1.status_code == 201
    assert res1.json()["limit_amount"] == 5000.0

    # Overwrite / Upsert same category and month
    payload2 = {
        "category": "Transport",
        "limit_amount": 7500.0,
        "month": "2026-10"
    }
    res2 = client.post("/api/budgets/", json=payload2, headers=test_user["headers"])
    assert res2.status_code == 201
    assert res2.json()["limit_amount"] == 7500.0

def test_budget_month_filter(client, test_user):
    client.post("/api/budgets/", json={
        "category": "Entertainment",
        "limit_amount": 3000.0,
        "month": "2026-11"
    }, headers=test_user["headers"])

    # Query for 2026-11
    res_nov = client.get("/api/budgets/?month=2026-11", headers=test_user["headers"])
    assert res_nov.status_code == 200
    assert all(b["month"] == "2026-11" for b in res_nov.json())
    assert any(b["category"] == "Entertainment" for b in res_nov.json())

    # Query for a future month with no budgets
    res_empty = client.get("/api/budgets/?month=2099-01", headers=test_user["headers"])
    assert res_empty.status_code == 200
    assert len(res_empty.json()) == 0

def test_update_and_delete_budget(client, test_user):
    create_res = client.post("/api/budgets/", json={
        "category": "Shopping",
        "limit_amount": 4000.0,
        "month": "2026-10"
    }, headers=test_user["headers"])
    budget_id = create_res.json()["id"]

    # Update limit
    update_res = client.put(f"/api/budgets/{budget_id}", json={
        "limit_amount": 6000.0
    }, headers=test_user["headers"])
    assert update_res.status_code == 200
    assert update_res.json()["limit_amount"] == 6000.0

    # Delete
    del_res = client.delete(f"/api/budgets/{budget_id}", headers=test_user["headers"])
    assert del_res.status_code == 200

    # Verify 404
    get_res = client.get(f"/api/budgets/{budget_id}", headers=test_user["headers"])
    assert get_res.status_code == 404

def test_budget_validation_rejected(client, test_user):
    # Negative limit
    res = client.post("/api/budgets/", json={
        "category": "Food",
        "limit_amount": -100.0,
        "month": "2026-10"
    }, headers=test_user["headers"])
    assert res.status_code == 422

    # Zero limit
    res_zero = client.post("/api/budgets/", json={
        "category": "Food",
        "limit_amount": 0.0,
        "month": "2026-10"
    }, headers=test_user["headers"])
    assert res_zero.status_code == 422

def test_multi_tenant_budget_isolation(client, test_user, second_user):
    # test_user creates a budget
    create_res = client.post("/api/budgets/", json={
        "category": "Health",
        "limit_amount": 10000.0,
        "month": "2026-10"
    }, headers=test_user["headers"])
    budget_id = create_res.json()["id"]

    # second_user should not see it in their list
    user2_list = client.get("/api/budgets/", headers=second_user["headers"]).json()
    assert not any(b["id"] == budget_id for b in user2_list)

    # second_user cannot access it by ID
    user2_get = client.get(f"/api/budgets/{budget_id}", headers=second_user["headers"])
    assert user2_get.status_code == 404

    # second_user cannot delete it
    user2_del = client.delete(f"/api/budgets/{budget_id}", headers=second_user["headers"])
    assert user2_del.status_code == 404
