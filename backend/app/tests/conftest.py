import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest_asyncio.fixture
async def async_client():
    """Create an async client for testing."""
    
    # Creamos el cliente de forma más simple
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
