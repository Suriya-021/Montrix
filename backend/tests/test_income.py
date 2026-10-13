def test_create_and_get_income(client, test_user):
    payload = {
        "source": "Salary",
        "amount": 75000.0,
        "date": "2026-10-01"
    }
    res = client.post("/api/income/", json=payload, headers=test_user["headers"])
    assert res.status_code == 201
    created = res.json()
    assert created["source"] == "Salary"
    assert created["amount"] == 75000.0
    assert created["date"] == "2026-10-01"
    income_id = created["id"]

    # List incomes
    list_res = client.get("/api/income/", headers=test_user["headers"])
    assert list_res.status_code == 200
    assert any(i["id"] == income_id for i in list_res.json())

    # Get single income
    single_res = client.get(f"/api/income/{income_id}", headers=test_user["headers"])
    assert single_res.status_code == 200
    assert single_res.json()["id"] == income_id

def test_update_income(client, test_user):
    create_res = client.post("/api/income/", json={
        "source": "Freelance Design",
        "amount": 15000.0,
        "date": "2026-10-05"
    }, headers=test_user["headers"])
    income_id = create_res.json()["id"]

    # Update amount and source
    update_res = client.put(f"/api/income/{income_id}", json={
        "source": "Freelance UX Design",
        "amount": 18000.0
    }, headers=test_user["headers"])
    assert update_res.status_code == 200
    assert update_res.json()["source"] == "Freelance UX Design"
    assert update_res.json()["amount"] == 18000.0

def test_delete_income(client, test_user):
    create_res = client.post("/api/income/", json={
        "source": "Stock Dividend",
        "amount": 2500.0,
        "date": "2026-10-10"
    }, headers=test_user["headers"])
    income_id = create_res.json()["id"]

    del_res = client.delete(f"/api/income/{income_id}", headers=test_user["headers"])
    assert del_res.status_code == 200

    get_res = client.get(f"/api/income/{income_id}", headers=test_user["headers"])
    assert get_res.status_code == 404

def test_income_validation_rejected(client, test_user):
    # Negative amount
    res = client.post("/api/income/", json={
        "source": "Invalid",
        "amount": -500.0,
        "date": "2026-10-01"
    }, headers=test_user["headers"])
    assert res.status_code == 422

    # Zero amount
    res_zero = client.post("/api/income/", json={
        "source": "Invalid Zero",
        "amount": 0.0,
        "date": "2026-10-01"
    }, headers=test_user["headers"])
    assert res_zero.status_code == 422

def test_multi_tenant_income_isolation(client, test_user, second_user):
    create_res = client.post("/api/income/", json={
        "source": "Secret Bonus",
        "amount": 50000.0,
        "date": "2026-10-01"
    }, headers=test_user["headers"])
    income_id = create_res.json()["id"]

    # second_user cannot see it
    user2_list = client.get("/api/income/", headers=second_user["headers"]).json()
    assert not any(i["id"] == income_id for i in user2_list)

    # second_user cannot access or delete it
    assert client.get(f"/api/income/{income_id}", headers=second_user["headers"]).status_code == 404
    assert client.delete(f"/api/income/{income_id}", headers=second_user["headers"]).status_code == 404
