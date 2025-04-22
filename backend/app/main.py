from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from contextlib import asynccontextmanager

from app.endpoints import books, headlines
from app.core.config import settings
from app.core.middlewares import ExceptionMiddleware
from app.scraping.scrape_books import BookScraper
from app.services.redis_service import RedisService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run scraping at startup
    async def run_scraping():
        scraper = BookScraper(
            base_url=settings.BOOK_SCRAPER_URL,
            redis_service=RedisService(),
            max_books=settings.MAX_BOOKS_TO_SCRAPE,
            price_limit=settings.PRICE_LIMIT,
        )
        books = await scraper.scrape_books()
        if not books:
            raise Exception("Error al inicializar la base de datos de libros")
        return books

    # Run the scraper
    background_tasks = BackgroundTasks()
    background_tasks.add_task(run_scraping)
    await background_tasks.__call__()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=None,
    lifespan=lifespan,
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception middleware
app.add_middleware(ExceptionMiddleware)

# Incluir routers
app.include_router(books.router, prefix=settings.API_V1_STR, tags=["books"])
app.include_router(headlines.router, prefix=settings.API_V1_STR, tags=["headlines"])


# Ruta para Swagger UI personalizada
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        title=f"{settings.PROJECT_NAME} - API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )


@app.get("/health", tags=["status"])
async def health():
    """
    Ruta que verifica que la API está en funcionamiento.
    """
    return {"status": "healthy"}
