import pytest
from unittest.mock import patch

pytest_plugins = ('pytest_asyncio',)


# Test para el endpoint /api/v1/headlines
@pytest.mark.asyncio
async def test_get_headlines(async_client):
    # Simular la respuesta esperada
    mock_headlines = {
        "headlines": [
            {
                "title": "Nuevo framework de Python",
                "url": "https://example.com/framework",
                "score": 120
            },
            {
                "title": "Tutorial de FastAPI",
                "url": "https://example.com/fastapi",
                "score": 95
            }
        ]
    }
    
    # Mockear la función que obtiene los titulares
    with patch("app.endpoints.headlines.get_headlines", return_value=mock_headlines):
        response = await async_client.get("/api/v1/headlines")
        
        assert response.status_code == 200
        assert "headlines" in response.json()
        assert isinstance(response.json()["headlines"], list)
        if len(response.json()["headlines"]) > 0:
            assert "title" in response.json()["headlines"][0]
            assert "url" in response.json()["headlines"][0]
            assert "score" in response.json()["headlines"][0]
