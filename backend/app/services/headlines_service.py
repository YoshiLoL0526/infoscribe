from scrape_hn import HackerNewsIntegration


def get_headlines_service() -> HackerNewsIntegration:
    return HackerNewsIntegration()
