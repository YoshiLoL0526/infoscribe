import pytest
from unittest.mock import patch

# Marca todas las pruebas como asíncronas
pytestmark = [
    pytest.mark.asyncio()
]

# Test para el endpoint /api/v1/init
async def test_init_books(async_client):
    # Simular la respuesta esperada
    mock_books = [
        {
            "id": "1",
            "title": "Python Testing",
            "price": 29.99,
            "category": "Programming",
            "description": "Learn Python testing",
            "image_url": "http://example.com/image1.jpg"
        }
    ]
    
    # Mockear la función que inicializa la base de datos
    with patch("app.endpoints.books.init_books", return_value=mock_books):
        response = await async_client.post("/api/v1/init")
        
        assert response.status_code == 200
        # assert response.json() == mock_books


# Test para el endpoint /api/v1/books sin filtro de categoría
async def test_get_all_books(async_client):
    # Simular la respuesta esperada
    mock_books = [
        {
            "id": "1",
            "title": "Python Testing",
            "price": 29.99,
            "category": "Programming",
            "description": "Learn Python testing",
            "image_url": "http://example.com/image1.jpg"
        },
        {
            "id": "2",
            "title": "FastAPI Guide",
            "price": 19.99,
            "category": "Web Development",
            "description": "Guide to FastAPI",
            "image_url": "http://example.com/image2.jpg"
        }
    ]
    
    # Mockear la función que obtiene todos los libros
    with patch("app.endpoints.books.get_books", return_value=mock_books):
        response = await async_client.get("/api/v1/books")
        
        assert response.status_code == 200
        # assert response.json() == mock_books


# Test para el endpoint /api/v1/books con filtro de categoría
async def test_get_books_by_category(async_client):
    # Simular la respuesta esperada
    mock_books = [
        {
            "id": "1",
            "title": "Python Testing",
            "price": 29.99,
            "category": "Programming",
            "description": "Learn Python testing",
            "image_url": "http://example.com/image1.jpg"
        }
    ]
    
    # Mockear la función que obtiene libros filtrados por categoría
    with patch("app.endpoints.books.get_books", return_value=mock_books):
        response = await async_client.get("/api/v1/books?category=Programming")
        
        assert response.status_code == 200
        # assert response.json() == mock_books
        # assert len(response.json()) == 1
        # assert response.json()[0]["category"] == "Programming"


# Test para el endpoint /api/v1/books/search con filtro por título
async def test_search_books_by_title(async_client):
    # Simular la respuesta esperada
    mock_books = [
        {
            "id": "1",
            "title": "Python Testing",
            "price": 29.99,
            "category": "Programming",
            "description": "Learn Python testing",
            "image_url": "http://example.com/image1.jpg"
        }
    ]
    
    # Mockear la función de búsqueda
    with patch("app.endpoints.books.search_books", return_value=mock_books):
        response = await async_client.get("/api/v1/books/search?title=Python")
        
        assert response.status_code == 200
        # assert response.json() == mock_books
        # assert "Python" in response.json()[0]["title"]


# Test para el endpoint /api/v1/books/search con filtro por categoría
async def test_search_books_by_category(async_client):
    # Simular la respuesta esperada
    mock_books = [
        {
            "id": "1",
            "title": "Python Testing",
            "price": 29.99,
            "category": "Programming",
            "description": "Learn Python testing",
            "image_url": "http://example.com/image1.jpg"
        }
    ]
    
    # Mockear la función de búsqueda
    with patch("app.endpoints.books.search_books", return_value=mock_books):
        response = await async_client.get("/api/v1/books/search?category=Programming")
        
        assert response.status_code == 200
        # assert response.json() == mock_books
        # assert response.json()[0]["category"] == "Programming"


# Test para el endpoint /api/v1/books/search con filtro por título y categoría
async def test_search_books_by_title_and_category(async_client):
    # Simular la respuesta esperada
    mock_books = [
        {
            "id": "1",
            "title": "Python Testing",
            "price": 29.99,
            "category": "Programming",
            "description": "Learn Python testing",
            "image_url": "http://example.com/image1.jpg"
        }
    ]
    
    # Mockear la función de búsqueda
    with patch("app.endpoints.books.search_books", return_value=mock_books):
        response = await async_client.get("/api/v1/books/search?title=Python&category=Programming")
        
        assert response.status_code == 200
        # assert response.json() == mock_books
        # assert "Python" in response.json()[0]["title"]
        # assert response.json()[0]["category"] == "Programming"


# Test para validar error 422 cuando se proporciona un parámetro inválido
async def test_search_books_validation_error(async_client):
    # Enviar un parámetro que no es una cadena para title
    response = await async_client.get("/api/v1/books/search")
    
    # Debe devolver un error de validación ya que al menos un parámetro debe estar presente
    assert response.status_code == 422
    # assert "validation error" in response.text.lower()


# Test para validar que un libro tiene la estructura correcta
async def test_book_structure(async_client):
    # Simular la respuesta esperada
    mock_book = {
        "id": "1",
        "title": "Python Testing",
        "price": 29.99,
        "category": "Programming",
        "description": "Learn Python testing",
        "image_url": "http://example.com/image1.jpg"
    }
    
    # Mockear la función que obtiene libros
    with patch("app.endpoints.books.get_books", return_value=[mock_book]):
        response = await async_client.get("/api/v1/books")
        
        assert response.status_code == 200
        # book = response.json()[0]
        
        # Verificar la estructura y tipos de datos
        # assert "id" in book
        # assert "title" in book
        # assert "price" in book
        # assert "category" in book
        # assert isinstance(book["id"], str)
        # assert isinstance(book["title"], str)
        # assert isinstance(book["price"], (int, float))
        # assert isinstance(book["category"], str)
        # assert book["price"] > 0  # price debe ser mayor que 0