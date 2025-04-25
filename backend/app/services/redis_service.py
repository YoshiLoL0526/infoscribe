from typing import List, Optional

import redis

from app.core.config import settings
from app.models.schemas import Book


class RedisService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=True,
        )

    async def store_book(self, book: Book) -> bool:
        """Almacena un libro en Redis"""
        try:
            book_data = book.model_dump()
            self.redis_client.hset(f"book:{book.id}", mapping=book_data)
            self.redis_client.sadd(f"category:{book.category.lower().replace(' ', '-')}", book.id)
            return True
        except Exception as e:
            print(f"Error storing book in Redis: {e}")
            return False

    async def get_books(self, category: Optional[str] = None) -> List[Book]:
        """Obtiene todos los libros o filtrados por categoría"""
        try:
            if category:
                # Obtener IDs de libros de la categoría específica
                book_ids = self.redis_client.smembers(f"category:{category.lower()}")

                # Si no hay libros en esa categoría, retornar lista vacía
                if not book_ids:
                    return []
            else:
                # Obtener todos los libros (buscar claves con patrón "book:*")
                keys = self.redis_client.keys("book:*")
                book_ids = [key.split(":")[1] for key in keys]

            books = []
            for book_id in book_ids:
                book_data = self.redis_client.hgetall(f"book:{book_id}")
                if book_data:
                    # Convertir tipos de datos
                    book_data["price"] = float(book_data["price"])
                    book_data["id"] = book_id
                    books.append(Book(**book_data))

            return books
        except Exception as e:
            print(f"Error getting books from Redis: {e}")
            return []

    async def search_books(
        self, title: Optional[str] = None, category: Optional[str] = None
    ) -> List[Book]:
        """Busca libros por título y/o categoría"""
        try:
            # Primero obtenemos los libros (todos o por categoría)
            books = await self.get_books(category)

            # Si hay un título para filtrar, lo aplicamos
            if title:
                title_lower = title.lower()
                books = [book for book in books if title_lower in book.title.lower()]

            return books
        except Exception as e:
            print(f"Error searching books in Redis: {e}")
            return []
    
    async def ping(self) -> bool:
        """Verifica la conexión a Redis"""
        try:
            return self.redis_client.ping()
        except redis.ConnectionError:
            return False


def get_redis_service() -> RedisService:
    return RedisService()
