import sys, os
import asyncio
import pytest
import pytest_asyncio

sys.path.append(os.path.abspath(os.path.join(__file__, "..", "..")))

from app.main import app


@pytest.fixture
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def async_client():
    """Yield a client that can be used to make async requests."""
    from httpx import AsyncClient
    from httpx._transports.asgi import ASGITransport
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client
