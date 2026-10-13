from datetime import date, timedelta

def test_create_and_get_expense(client, test_user):
    payload = {
        "amount": 249.99,
        "category": "Food",
        "description": "Lunch at Bistro",
        "date": str(date.today())
    }
    create_res = client.post("/api/expenses/", json=payload, headers=test_user["headers"])
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["amount"] == 249.99
    assert created["category"] == "Food"
    assert created["description"] == "Lunch at Bistro"
    assert created["date"] == str(date.today())
    expense_id = created["id"]

    # Fetch all
    get_res = client.get("/api/expenses/", headers=test_user["headers"])
    assert get_res.status_code == 200
    all_expenses = get_res.json()
    assert any(e["id"] == expense_id for e in all_expenses)

    # Fetch single
    single_res = client.get(f"/api/expenses/{expense_id}", headers=test_user["headers"])
    assert single_res.status_code == 200
    assert single_res.json()["id"] == expense_id

def test_expense_validation_rejected(client, test_user):
    # Invalid category (empty string)
    bad_cat = {
        "amount": 50.0,
        "category": "   ",
        "description": "Invalid",
        "date": str(date.today())
    }
    res = client.post("/api/expenses/", json=bad_cat, headers=test_user["headers"])
    assert res.status_code == 422

    # Negative amount
    bad_amount = {
        "amount": -25.0,
        "category": "Food",
        "description": "Negative",
        "date": str(date.today())
    }
    res = client.post("/api/expenses/", json=bad_amount, headers=test_user["headers"])
    assert res.status_code == 422

def test_update_and_delete_expense(client, test_user):
    # Create
    create_res = client.post("/api/expenses/", json={
        "amount": 100.0,
        "category": "Transport",
        "description": "Taxi ride",
        "date": str(date.today())
    }, headers=test_user["headers"])
    expense_id = create_res.json()["id"]

    # Update
    update_res = client.put(f"/api/expenses/{expense_id}", json={
        "amount": 120.50,
        "category": "Transport",
        "description": "Taxi ride with tip",
        "date": str(date.today())
    }, headers=test_user["headers"])
    assert update_res.status_code == 200
    assert update_res.json()["amount"] == 120.50
    assert update_res.json()["description"] == "Taxi ride with tip"

    # Delete
    del_res = client.delete(f"/api/expenses/{expense_id}", headers=test_user["headers"])
    assert del_res.status_code == 200

    # Verify 404 after deletion
    get_res = client.get(f"/api/expenses/{expense_id}", headers=test_user["headers"])
    assert get_res.status_code == 404

def test_multi_tenant_expense_isolation(client, test_user, second_user):
    # Primary user creates an expense
    create_res = client.post("/api/expenses/", json={
        "amount": 500.0,
        "category": "Shopping",
        "description": "Secret Gadget",
        "date": str(date.today())
    }, headers=test_user["headers"])
    primary_expense_id = create_res.json()["id"]

    # Second user tries to access primary user's expense -> 404 Not Found
    get_res = client.get(f"/api/expenses/{primary_expense_id}", headers=second_user["headers"])
    assert get_res.status_code == 404

    # Second user tries to delete primary user's expense -> 404 Not Found
    del_res = client.delete(f"/api/expenses/{primary_expense_id}", headers=second_user["headers"])
    assert del_res.status_code == 404

def test_expense_monthly_stats(client, test_user):
    target_month = "2026-07"
    client.post("/api/expenses/", json={
        "amount": 150.0,
        "category": "Food",
        "description": "July Pizza",
        "date": f"{target_month}-15"
    }, headers=test_user["headers"])

    client.post("/api/expenses/", json={
        "amount": 80.0,
        "category": "Transport",
        "description": "July Metro",
        "date": f"{target_month}-20"
    }, headers=test_user["headers"])

    # Query stats specifically for July
    res = client.get(f"/api/expenses/stats?month={target_month}", headers=test_user["headers"])
    assert res.status_code == 200
    stats = res.json()
    assert stats["month"] == target_month
    assert stats["month_spent"] >= 230.0
    breakdown_map = {item["name"]: item["value"] for item in stats["category_breakdown"]}
    assert breakdown_map.get("Food", 0) >= 150.0
    assert breakdown_map.get("Transport", 0) >= 80.0

def test_export_expenses_csv(client, test_user):
    res = client.get("/api/expenses/export", headers=test_user["headers"])
    assert res.status_code == 200
    assert "text/csv" in res.headers.get("content-type", "")
    assert "attachment; filename=" in res.headers.get("content-disposition", "")
    content = res.text
    assert "Date (Transaction)" in content
    assert "Amount (INR)" in content

def test_expense_filtering_sorting_and_pagination(client, test_user):
    # Seed 5 specific expenses with varied dates, categories, descriptions, amounts
    items_to_create = [
        {"amount": 10.0, "category": "Food", "description": "Morning Coffee", "date": "2026-03-01"},
        {"amount": 50.0, "category": "Food", "description": "Dinner Sushi", "date": "2026-03-10"},
        {"amount": 200.0, "category": "Transport", "description": "Flight Ticket", "date": "2026-03-15"},
        {"amount": 30.0, "category": "Shopping", "description": "Grocery Books", "date": "2026-04-01"},
        {"amount": 500.0, "category": "Bills", "description": "Apartment Electricity", "date": "2026-04-15"},
    ]
    for item in items_to_create:
        res = client.post("/api/expenses/", json=item, headers=test_user["headers"])
        assert res.status_code == 200

    # Test 1: Date Range Filter (March only)
    res_range = client.get("/api/expenses/?start_date=2026-03-01&end_date=2026-03-31", headers=test_user["headers"])
    assert res_range.status_code == 200
    march_items = res_range.json()
    assert all("2026-03" in x["date"] for x in march_items)
    assert any(x["description"] == "Morning Coffee" for x in march_items)
    assert not any(x["description"] == "Apartment Electricity" for x in march_items)

    # Test 2: Category Filter
    res_cat = client.get("/api/expenses/?category=Transport", headers=test_user["headers"])
    assert res_cat.status_code == 200
    transport_items = res_cat.json()
    assert all(x["category"] == "Transport" for x in transport_items)
    assert any(x["description"] == "Flight Ticket" for x in transport_items)

    # Test 3: Search Filter
    res_search = client.get("/api/expenses/?search=sushi", headers=test_user["headers"])
    assert res_search.status_code == 200
    search_items = res_search.json()
    assert len(search_items) >= 1
    assert any("Sushi" in x["description"] for x in search_items)

    # Test 4: Sorting by Amount (Ascending)
    res_sort_asc = client.get("/api/expenses/?sort_by=amount&sort_order=asc", headers=test_user["headers"])
    assert res_sort_asc.status_code == 200
    asc_items = res_sort_asc.json()
    amounts = [x["amount"] for x in asc_items]
    assert amounts == sorted(amounts)

    # Test 5: Sorting by Amount (Descending)
    res_sort_desc = client.get("/api/expenses/?sort_by=amount&sort_order=desc", headers=test_user["headers"])
    assert res_sort_desc.status_code == 200
    desc_items = res_sort_desc.json()
    amounts_desc = [x["amount"] for x in desc_items]
    assert amounts_desc == sorted(amounts_desc, reverse=True)

    # Test 6: Pagination (page=1, page_size=2)
    res_page = client.get("/api/expenses/?page=1&page_size=2", headers=test_user["headers"])
    assert res_page.status_code == 200
    page_data = res_page.json()
    assert "items" in page_data
    assert "total" in page_data
    assert page_data["page"] == 1
    assert page_data["page_size"] == 2
    assert len(page_data["items"]) == 2
    assert page_data["total"] >= 5
    assert page_data["total_pages"] >= 3

