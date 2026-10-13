from datetime import date

def test_get_default_categories(client, test_user):
    res = client.get("/api/categories/", headers=test_user["headers"])
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) >= 10
    names = [c["name"] for c in categories]
    assert "Food" in names
    assert "Transport" in names
    assert "Bills" in names
    # Verify defaults are marked is_default=True
    food = next(c for c in categories if c["name"] == "Food")
    assert food["is_default"] is True

def test_create_custom_category(client, test_user):
    payload = {
        "name": "House Rent",
        "color": "#F97316",
        "icon": "Home"
    }
    res = client.post("/api/categories/", json=payload, headers=test_user["headers"])
    assert res.status_code == 201
    created = res.json()
    assert created["name"] == "House Rent"
    assert created["color"] == "#F97316"
    assert created["icon"] == "Home"
    assert created["is_default"] is False
    cat_id = created["id"]

    # Verify present in list
    list_res = client.get("/api/categories/", headers=test_user["headers"])
    assert any(c["id"] == cat_id for c in list_res.json())

def test_create_duplicate_category_rejected(client, test_user):
    # Try duplicate of system default (case-insensitive)
    dup_default = client.post("/api/categories/", json={"name": "food"}, headers=test_user["headers"])
    assert dup_default.status_code == 400
    assert "already exists" in dup_default.json()["detail"].lower()

    # Create custom
    client.post("/api/categories/", json={"name": "Pet Care"}, headers=test_user["headers"])
    
    # Try duplicate of custom category
    dup_custom = client.post("/api/categories/", json={"name": "pet care"}, headers=test_user["headers"])
    assert dup_custom.status_code == 400
    assert "already exists" in dup_custom.json()["detail"].lower()

def test_delete_custom_category(client, test_user):
    create_res = client.post("/api/categories/", json={"name": "Gym & Fitness"}, headers=test_user["headers"])
    cat_id = create_res.json()["id"]

    # Delete custom category
    del_res = client.delete(f"/api/categories/{cat_id}", headers=test_user["headers"])
    assert del_res.status_code == 200

    # Verify gone
    list_res = client.get("/api/categories/", headers=test_user["headers"])
    assert not any(c["id"] == cat_id for c in list_res.json())

def test_cannot_delete_default_category(client, test_user):
    list_res = client.get("/api/categories/", headers=test_user["headers"])
    food = next(c for c in list_res.json() if c["name"] == "Food")
    
    del_res = client.delete(f"/api/categories/{food['id']}", headers=test_user["headers"])
    assert del_res.status_code == 400
    assert "default" in del_res.json()["detail"].lower()

def test_multi_tenant_category_isolation(client, test_user, second_user):
    create_res = client.post("/api/categories/", json={"name": "Private Consulting"}, headers=test_user["headers"])
    cat_id = create_res.json()["id"]

    # second_user cannot see test_user's custom category
    user2_list = client.get("/api/categories/", headers=second_user["headers"]).json()
    assert not any(c["id"] == cat_id for c in user2_list)

    # second_user cannot delete it
    assert client.delete(f"/api/categories/{cat_id}", headers=second_user["headers"]).status_code == 404

def test_create_expense_with_custom_category(client, test_user):
    # Create custom category
    client.post("/api/categories/", json={"name": "Gaming Hardware"}, headers=test_user["headers"])

    # Create expense with that custom category
    exp_res = client.post("/api/expenses/", json={
        "amount": 4500.0,
        "category": "Gaming Hardware",
        "description": "Mechanical Keyboard",
        "date": str(date.today())
    }, headers=test_user["headers"])
    assert exp_res.status_code == 200
    exp = exp_res.json()
    assert exp["category"] == "Gaming Hardware"
    assert exp["amount"] == 4500.0
