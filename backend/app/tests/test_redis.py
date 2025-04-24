import pytest
from app.services.redis_service import RedisService

pytest_plugins = ("pytest_asyncio",)


@pytest.mark.asyncio
async def test_redis_connection():
    # Crear instancia del servicio Redis
    redis_service = RedisService()

    # Probar la conexión
    is_connected = await redis_service.ping()
    assert is_connected == True
