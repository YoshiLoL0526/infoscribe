#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Hacker News Integration Module - Async Version

This module provides asynchronous functionality to fetch and search top stories from Hacker News
for use with FastAPI services.
"""

import os
import logging
import asyncio
from typing import List, Dict, Optional, Union
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)


class HackerNewsIntegration:
    """
    A class to integrate asynchronously with Hacker News and fetch top stories.
    Uses httpx for async HTTP requests and BeautifulSoup for HTML parsing.
    """

    def __init__(self, logs_dir: str = "logs"):
        """Initialize a new HackerNewsIntegration instance."""
        # Configurar logger
        os.makedirs(logs_dir, exist_ok=True)
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(os.path.join(logs_dir, "hacker_news.log")),
                logging.StreamHandler(),
            ],
        )
        self.logger = logging.getLogger("async_hacker_news")
        self.logger.info("Initializing AsyncHackerNewsIntegration")

        # Timeout configuration for HTTP requests
        self.timeout = httpx.Timeout(30.0)

        # Headers to mimic a browser
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        }

    @retry(
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def _load_page(self, url: str) -> BeautifulSoup:
        """
        Load a page using httpx with retry logic.

        Args:
            url: The URL to load.

        Returns:
            BeautifulSoup object of the parsed page.

        Raises:
            httpx.HTTPError: If page can't be loaded after multiple attempts.
        """
        self.logger.info(f"Loading page: {url}")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                if not soup.select(".athing"):
                    raise ValueError("Page loaded but no stories found")
                return soup
        except (httpx.HTTPError, httpx.TimeoutException) as e:
            self.logger.error(f"Error loading page {url}: {e}")
            raise

    def _extract_story_data(self, story_row, subtext_row) -> Dict[str, Union[str, int]]:
        """
        Extract story data from HTML elements.

        Args:
            story_row: The BeautifulSoup element containing story data.
            subtext_row: The BeautifulSoup element containing subtext (score, etc).

        Returns:
            Dict containing story title, URL, and score.
        """
        story_id = story_row.get("id")

        # Get title and URL
        title_element = story_row.select_one(".titleline")
        title_link = title_element.find("a")
        title = title_link.text.strip()
        url = title_link.get("href")

        # Get domain if available
        try:
            domain = urlparse(url).netloc
        except:
            domain = "unknown"

        # Get score
        score = 0
        try:
            score_element = subtext_row.select_one(".score")
            if score_element:
                score_text = score_element.text
                score = int(score_text.split()[0])
        except (AttributeError, ValueError) as e:
            self.logger.debug(f"Story {story_id} has no score: {e}")

        return {"title": title, "url": url, "score": score}

    async def fetch_top_stories(
        self, pages: int = 5
    ) -> List[Dict[str, Union[str, int]]]:
        """
        Fetch top stories from Hacker News asynchronously.

        Args:
            pages: Number of pages to fetch (max 5).

        Returns:
            List of dictionaries containing story data.
        """
        stories = []
        pages = min(pages, 5)

        # Create tasks for all pages
        tasks = []
        for page in range(1, pages + 1):
            url = (
                "https://news.ycombinator.com/"
                if page == 1
                else f"https://news.ycombinator.com/news?p={page}"
            )
            tasks.append(self._process_page(url, page))

        # Execute all page processing tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Collect results, filtering out exceptions
        for page_stories in results:
            if isinstance(page_stories, list):
                stories.extend(page_stories)
            else:
                self.logger.error(f"Error processing page: {page_stories}")

        self.logger.info(f"Successfully fetched {len(stories)} stories total")
        return stories

    async def _process_page(
        self, url: str, page_num: int
    ) -> List[Dict[str, Union[str, int]]]:
        """
        Process a single page of Hacker News.

        Args:
            url: URL of the page to process
            page_num: Page number for logging

        Returns:
            List of stories from this page
        """
        page_stories = []
        try:
            soup = await self._load_page(url)

            # Find all story rows and their corresponding subtext rows
            story_rows = soup.select(".athing")
            self.logger.info(f"Found {len(story_rows)} stories on page {page_num}")

            for story_row in story_rows:
                try:
                    # Find the subtext row that follows this story row
                    subtext_row = story_row.find_next_sibling("tr")
                    if subtext_row and subtext_row.select_one(".subtext"):
                        story_data = self._extract_story_data(story_row, subtext_row)
                        page_stories.append(story_data)
                except Exception as e:
                    self.logger.warning(f"Failed to extract story data: {e}")
                    continue
        except Exception as e:
            self.logger.error(f"Error processing page {page_num}: {e}")
            raise

        return page_stories

    async def search_news(
        self, query: Optional[str] = None
    ) -> List[Dict[str, Union[str, int]]]:
        """
        Get recent news asynchronously, optionally filtered by search term.

        Args:
            query: Optional search term to filter results.

        Returns:
            List of stories matching the query or all stories if no query.
        """
        stories = await self.fetch_top_stories()

        if query:
            query = query.lower()
            filtered_stories = [
                story
                for story in stories
                if query in story["title"].lower()
                or query in story.get("domain", "").lower()
            ]
            self.logger.info(
                f"Found {len(filtered_stories)} stories matching query '{query}'"
            )
            return filtered_stories

        return stories


async def main():
    """Main function to demonstrate the AsyncHackerNewsIntegration class."""
    hn = HackerNewsIntegration()

    try:
        # Get all top stories
        all_stories = await hn.search_news()
        print(f"Se encontraron {len(all_stories)} historias principales")

        # Show top 5 stories
        for i, story in enumerate(all_stories[:5]):
            print(f"{i+1}. {story['title']} (Score: {story['score']})")
            print(f"   URL: {story['url']}")
            print(f"   Domain: {story['domain']}")
            print("-" * 50)

        # Example search by term
        search_term = "openai"
        filtered_stories = await hn.search_news(search_term)
        print(f"\nBúsqueda por '{search_term}': {len(filtered_stories)} resultados")
        for i, story in enumerate(filtered_stories[:3]):
            print(f"{i+1}. {story['title']} (Score: {story['score']})")

    except Exception as e:
        hn.logger.critical(f"Unhandled exception in main: {e}", exc_info=True)
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
