from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException

from app.core.config import settings
from app.models.schemas import Book
from app.services.redis_service import RedisService, get_redis_service
from app.scraping.scrape_books import BookScraper

router = APIRouter()


@router.post(
    "/init",
    response_model=List[Book],
    summary="Inicializa la base de datos con libros scrapeados",
)
async def init_books(redis_service: RedisService = Depends(get_redis_service)):
    """
    Endpoint para inicializar la base de datos con libros extraídos de la web.
    Este endpoint debe ser llamado durante la inicialización del contenedor.
    """
    scraper = BookScraper(
        base_url=settings.BOOK_SCRAPER_URL,
        redis_host=settings.REDIS_HOST,
        redis_port=settings.REDIS_PORT,
    )
    books = await scraper.scrape_books()

    if not books:
        raise HTTPException(
            status_code=500, detail="Error al inicializar la base de datos de libros"
        )

    return books


@router.get(
    "/books",
    response_model=List[Book],
    summary="Obtiene todos los libros o filtrados por categoría",
)
async def get_books(
    category: Optional[str] = Query(None, description="Categoría para filtrar libros"),
    redis_service: RedisService = Depends(get_redis_service),
):
    """
    Obtiene todos los libros almacenados en Redis.
    Opcionalmente se puede filtrar por categoría.
    """
    books = await redis_service.get_books(category)
    return books


@router.get(
    "/books/search",
    response_model=List[Book],
    summary="Busca libros por título y/o categoría",
)
async def search_books(
    title: Optional[str] = Query(
        None, description="Título o parte del título para buscar"
    ),
    category: Optional[str] = Query(None, description="Categoría para filtrar libros"),
    redis_service: RedisService = Depends(get_redis_service),
):
    """
    Busca libros por título y/o categoría.
    Al menos uno de los parámetros debe estar presente.
    """
    if not title and not category:
        raise HTTPException(
            status_code=422,
            detail="Debe proporcionar al menos un parámetro de búsqueda (título o categoría)",
        )

    books = await redis_service.search_books(title, category)
    return books
