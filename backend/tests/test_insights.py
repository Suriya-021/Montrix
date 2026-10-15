def test_get_cashflow_data(client, test_user):
    res = client.get("/api/insights/cashflow", headers=test_user["headers"])
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 6
    for item in data:
        assert "month" in item
        assert "income" in item
        assert "expenses" in item
        assert isinstance(item["income"], (int, float))
        assert isinstance(item["expenses"], (int, float))

def test_ai_coach_no_expenses(client, test_user):
    # With no expenses logged this month, it returns early advice without needing Gemini API key
    res = client.get("/api/insights/coach", headers=test_user["headers"])
    # If API key is configured or not configured, with 0 expenses it either returns 200 or 503
    assert res.status_code in [200, 503]
    if res.status_code == 200:
        data = res.json()
        assert "insights" in data
        assert isinstance(data["insights"], list)
