import pytest
from httpx import AsyncClient
from unittest import mock

from app.core.config import settings
from app.models.schemas import Headline


# Mock de la función get_top_headlines
async def mock_get_top_headlines(limit=30):
    return [
        Headline(
            id=1,
            title="Test Headline 1",
            url="https://example.com/1",
            score=100,
            author="user1",
        ),
        Headline(
            id=2,
            title="Test Headline 2",
            url="https://example.com/2",
            score=90,
            author="user2",
        ),
        Headline(
            id=3,
            title="Test Headline 3",
            url="https://example.com/3",
            score=80,
            author="user3",
        ),
    ]


@pytest.mark.asyncio
async def test_get_headlines(async_client: AsyncClient):
    # Mock la función get_top_headlines del servicio HackerNews
    with mock.patch(
        "app.services.headlines_service.HackerNewsService.get_top_headlines",
        mock_get_top_headlines,
    ):
        response = await async_client.get(f"{settings.API_V1_STR}/headlines")
        assert response.status_code == 200
        data = response.json()
        assert "headlines" in data
        headlines = data["headlines"]
        assert len(headlines) == 3
        assert headlines[0]["title"] == "Test Headline 1"
