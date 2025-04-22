import pytest
from unittest.mock import patch

pytest_plugins = ('pytest_asyncio',)


# Test para el endpoint /api/v1/books sin filtro de categoría
@pytest.mark.asyncio
async def test_get_all_books(async_client):
    # Mockear la función que obtiene todos los libros
    with patch("app.endpoints.books.get_books"):
        response = await async_client.get("/api/v1/books")
        
        assert response.status_code == 200
        assert isinstance(response.json()["books"], list)
        if len(response.json()["books"]) > 0:
            assert "id" in response.json()["books"][0]
            assert "title" in response.json()["books"][0]
            assert "price" in response.json()["books"][0]
            assert "category" in response.json()["books"][0]


# Test para el endpoint /api/v1/books con filtro de categoría
@pytest.mark.asyncio
async def test_get_books_by_category(async_client):
    with patch("app.endpoints.books.get_books"):
        response = await async_client.get("/api/v1/books?category=Science")
        
        assert response.status_code == 200
        assert isinstance(response.json()["books"], list)
        if len(response.json()["books"]) > 0:
            assert "id" in response.json()["books"][0]
            assert "title" in response.json()["books"][0]
            assert "price" in response.json()["books"][0]
            assert "category" in response.json()["books"][0]
            assert response.json()["books"][0]["category"] == "Science"


# Test para el endpoint /api/v1/books/search con filtro por título
@pytest.mark.asyncio
async def test_search_books_by_title(async_client):
    with patch("app.endpoints.books.search_books"):
        response = await async_client.get("/api/v1/books/search?title=Railway")
        
        assert response.status_code == 200
        assert isinstance(response.json()["books"], list)
        if len(response.json()["books"]) > 0:
            assert "id" in response.json()["books"][0]
            assert "title" in response.json()["books"][0]
            assert "price" in response.json()["books"][0]
            assert "category" in response.json()["books"][0]
            assert "Railway".lower() in response.json()["books"][0]["title"].lower()


# Test para el endpoint /api/v1/books/search con filtro por categoría
@pytest.mark.asyncio
async def test_search_books_by_category(async_client):
    with patch("app.endpoints.books.search_books"):
        response = await async_client.get("/api/v1/books/search?category=Science")
        
        assert response.status_code == 200
        assert isinstance(response.json()["books"], list)
        if len(response.json()["books"]) > 0:
            assert "id" in response.json()["books"][0]
            assert "title" in response.json()["books"][0]
            assert "price" in response.json()["books"][0]
            assert "category" in response.json()["books"][0]
            assert response.json()["books"][0]["category"] == "Science"


# Test para el endpoint /api/v1/books/search con filtro por título y categoría
@pytest.mark.asyncio
async def test_search_books_by_title_and_category(async_client):
    with patch("app.endpoints.books.search_books"):
        response = await async_client.get("/api/v1/books/search?title=Moving&category=Romance")
        
        assert response.status_code == 200
        assert isinstance(response.json()["books"], list)
        if len(response.json()["books"]) > 0:
            assert "id" in response.json()["books"][0]
            assert "title" in response.json()["books"][0]
            assert "price" in response.json()["books"][0]
            assert "category" in response.json()["books"][0]
            assert "Moving".lower() in response.json()["books"][0]["title"].lower()
            assert response.json()["books"][0]["category"] == "Romance"


# Test para validar error 422 cuando se proporciona un parámetro inválido
@pytest.mark.asyncio
async def test_search_books_validation_error(async_client):
    response = await async_client.get("/api/v1/books/search")

    assert response.status_code == 422


# Test para validar que un libro tiene la estructura correcta
@pytest.mark.asyncio
async def test_book_structure(async_client):
    # Simular la respuesta esperada
    mock_book = {
        "id": "1",
        "title": "Python Testing",
        "price": 29.99,
        "category": "Programming",
        "image_url": "http://example.com/image1.jpg"
    }
    
    # Mockear la función que obtiene libros
    with patch("app.endpoints.books.get_books", return_value=[mock_book]):
        response = await async_client.get("/api/v1/books")
        
        assert response.status_code == 200
        if len(response.json()["books"]) > 0:
            book = response.json()["books"][0]

            assert "id" in book
            assert "title" in book
            assert "price" in book
            assert "category" in book
            assert isinstance(book["id"], str)
            assert isinstance(book["title"], str)
            assert isinstance(book["price"], (int, float))
            assert isinstance(book["category"], str)
            assert book["price"] > 0


# Test para validar que un libro tiene la estructura correcta
@pytest.mark.asyncio
async def test_book_structure_search(async_client):
    # Simular la respuesta esperada
    mock_book = {
        "id": "1",
        "title": "Python Testing",
        "price": 29.99,
        "category": "Programming",
        "image_url": "http://example.com/image1.jpg"
    }
    
    # Mockear la función que obtiene libros
    with patch("app.endpoints.books.search_books", return_value=[mock_book]):
        response = await async_client.get("/api/v1/books/search?title=Python")
        
        assert response.status_code == 200
        if len(response.json()["books"]) > 0:
            book = response.json()["books"][0]

            assert "id" in book
            assert "title" in book
            assert "price" in book
            assert "category" in book
            assert isinstance(book["id"], str)
            assert isinstance(book["title"], str)
            assert isinstance(book["price"], (int, float))
            assert isinstance(book["category"], str)
            assert book["price"] > 0
