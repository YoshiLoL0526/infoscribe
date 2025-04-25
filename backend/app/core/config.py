import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "PrintAI API"
    API_V1_STR: str = "/api/v1"

    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB: int = int(os.getenv("REDIS_DB", 0))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")

    REMOTE_DRIVER_URL = os.getenv("REMOTE_DRIVER_URL")

    HACKER_NEWS_URL: str = "https://news.ycombinator.com/"
    BOOK_SCRAPER_URL: str = os.getenv("BOOK_SCRAPER_URL", "http://books.toscrape.com")

    MAX_BOOKS_TO_SCRAPE: int = int(os.getenv("MAX_BOOKS_TO_SCRAPE", 100))
    PRICE_LIMIT: float = float(os.getenv("PRICE_LIMIT", 20.0))

    BACKEND_CORS_ORIGINS: list = os.getenv("BACKEND_CORS_ORIGINS", "*").split(",")
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "1/second")


settings = Settings()
