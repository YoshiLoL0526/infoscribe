from app.core.config import settings
from app.scraping.scrape_hn import HackerNewsIntegration


def get_headlines_service() -> HackerNewsIntegration:
    return HackerNewsIntegration(driver_url=settings.REMOTE_DRIVER_URL)
