import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest_asyncio.fixture(autouse=True)
def disable_rate_limit():
    """
    Desactiva el rate limiter antes de cada test
    y lo vuelve a activar después.
    """
    app.state.limiter.enabled = False
    yield
    app.state.limiter.enabled = True


@pytest_asyncio.fixture
async def async_client():
    """Create an async client for testing."""

    # Creamos el cliente de forma más simple
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client
