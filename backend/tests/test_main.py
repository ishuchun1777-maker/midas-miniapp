import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.0.0", "service": "MIDAS API"}

@pytest.mark.asyncio
async def test_listings_unauthorized():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/listings/")
    # This should be public
    assert response.status_code == 200
    assert "items" in response.json()

@pytest.mark.asyncio
async def test_admin_stats_protected():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/admin/stats")
    # Should be 401 Unauthorized without token
    assert response.status_code == 401
