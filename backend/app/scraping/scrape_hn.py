#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Hacker News Integration Module - Selenium Async Version

This module provides asynchronous functionality to fetch and search top stories from Hacker News
using Selenium for use with FastAPI services.
"""

import os
import re
import logging
import asyncio
from typing import List, Dict, Optional, Union
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    WebDriverException,
)
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.config import settings
from app.models.schemas import Headline


class HackerNewsIntegration:
    """
    A class to integrate asynchronously with Hacker News and fetch top stories.
    Uses Selenium for web automation with automatic WebDriver configuration.
    """

    def __init__(self, driver_url: Optional[str] = None, logs_dir: str = "logs"):
        """
        Initialize a new HackerNewsIntegration instance.

        Args:
            driver_url: Optional URL of the Selenium driver to use.
                        If None, will automatically set up a local driver.
            logs_dir: Directory for log files
        """
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
        self.logger = logging.getLogger("selenium_hacker_news")
        self.logger.info("Initializing SeleniumHackerNewsIntegration")

        # Store driver URL for creating new sessions
        self.driver_url = driver_url
        self.use_local_driver = driver_url is None
        self.logger.info(f"Using {'local' if self.use_local_driver else 'remote'} WebDriver")

        # Configuration for Selenium wait timeouts
        self.wait_timeout = 30  # seconds

    async def _create_driver(self):
        """
        Create a new driver instance, either local or remote.
        Returns a WebDriver instance or raises an exception if creation fails.
        """
        loop = asyncio.get_event_loop()
        driver = None
        try:
            driver = await loop.run_in_executor(
                None, lambda: self._create_driver_sync()
            )
            if not driver:
                raise ValueError("Failed to create WebDriver instance")
            return driver
        except Exception as e:
            self.logger.error(f"Error creating WebDriver: {e}")
            if driver:
                await loop.run_in_executor(None, driver.quit)
            raise

    def _create_driver_sync(self):
        """
        Synchronous method to create a driver instance, either local or remote.
        Returns a WebDriver instance.
        """
        try:
            options = webdriver.ChromeOptions()
            options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1920,1080")

            # User agent to mimic a browser
            options.add_argument(
                "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            )

            if self.use_local_driver:
                # Automatically download and use local ChromeDriver
                self.logger.info("Setting up local ChromeDriver")
                service = Service(ChromeDriverManager().install())
                driver = webdriver.Chrome(service=service, options=options)
            else:
                # Connect to remote Selenium instance
                self.logger.info(f"Connecting to Selenium server at {self.driver_url}")
                driver = webdriver.Remote(command_executor=self.driver_url, options=options)

            # Test if driver is responsive
            driver.title  # This will raise an exception if the driver is not working
            return driver
        except Exception as e:
            self.logger.error(f"Failed to create WebDriver: {e}")
            raise

    @retry(
        retry=retry_if_exception_type(
            (TimeoutException, NoSuchElementException, WebDriverException)
        ),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def _load_page(self, url: str):
        """
        Load a page using Selenium with retry logic.

        Args:
            url: The URL to load.

        Returns:
            Selenium driver with loaded page

        Raises:
            WebDriverException: If there are issues with the WebDriver
            TimeoutException: If page elements can't be loaded after multiple attempts.
        """
        self.logger.info(f"Loading page: {url}")

        loop = asyncio.get_event_loop()
        driver = None

        try:
            # Create a new driver for this page
            driver = await self._create_driver()
            if not driver:
                raise WebDriverException("Failed to create WebDriver")

            # Navigate to the URL
            self.logger.debug(f"Navigating to {url}")
            await loop.run_in_executor(None, lambda: driver.get(url))

            # Wait for stories to load
            self.logger.debug("Waiting for stories to load")
            await loop.run_in_executor(
                None,
                lambda: WebDriverWait(driver, self.wait_timeout).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".athing"))
                ),
            )

            return driver
        except Exception as e:
            self.logger.error(f"Error loading page {url}: {e}")
            if driver:
                try:
                    await loop.run_in_executor(None, driver.quit)
                except:
                    pass
            raise

    def _extract_story_data(self, story_row, subtext_row) -> Headline:
        """
        Extract story data from Selenium elements.

        Args:
            story_row: The Selenium element containing story data.
            subtext_row: The Selenium element containing subtext (score, etc).

        Returns:
            Dict containing story title, URL, and score.
        """
        story_id = story_row.get_attribute("id")

        # Get title and URL
        title_element = story_row.find_element(By.CSS_SELECTOR, ".titleline")
        title_link = title_element.find_element(By.TAG_NAME, "a")
        title = title_link.text.strip()
        url = title_link.get_attribute("href")

        # Get score
        score = 0
        try:
            # Buscar por atributo que comienza con "score_" o la clase tradicional "score"
            score_element = None
            # Intenta encontrar el elemento con clase que comienza con "score_"
            score_elements = subtext_row.find_elements(By.CSS_SELECTOR, "[class^='score_']")
            if score_elements:
                score_element = score_elements[0]
            else:
                # Intenta con la clase tradicional "score"
                score_elements = subtext_row.find_elements(By.CSS_SELECTOR, ".score")
                if score_elements:
                    score_element = score_elements[0]
                    
            if score_element:
                score_text = score_element.text
                # Extraer solo los dígitos del texto de puntuación
                score_digits = re.search(r'(\d+)', score_text)
                if score_digits:
                    score = int(score_digits.group(1))
        except Exception as e:
            self.logger.debug(f"Story {story_id} has no score: {e}")

        return Headline(
            title=title,
            url=url,
            score=score
        )

    async def fetch_top_stories(self, pages: int = 5) -> List[Dict[str, Union[str, int]]]:
        """
        Fetch top stories from Hacker News asynchronously, up to a specified limit.
        """
        stories = []
        semaphore = asyncio.Semaphore(5)

        async def bounded_process_page(url, page):
            async with semaphore:
                return await self._process_page(url, page)

        # Usar gather en lugar de TaskGroup
        tasks = []
        for page in range(1, pages + 1):
            url = (
                settings.HACKER_NEWS_URL
                if page == 1
                else f"{settings.HACKER_NEWS_URL}?p={page}"
            )
            tasks.append(bounded_process_page(url, page))
        
        page_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Procesar resultados
        for page_result in page_results:
            if isinstance(page_result, list):
                for story in page_result:
                        stories.append(story)
            elif isinstance(page_result, Exception):
                self.logger.error(f"Error processing page: {page_result}")
            else:
                self.logger.error(f"Error processing page: {page_result}")

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
        loop = asyncio.get_event_loop()
        driver = None

        try:
            # Load the page with Selenium
            driver = await self._load_page(url)
            if not driver:
                self.logger.error(f"Failed to get driver for page {page_num}")
                return []

            # Find all story rows
            story_rows = await loop.run_in_executor(
                None, lambda: driver.find_elements(By.CSS_SELECTOR, ".athing")
            )
            self.logger.info(f"Found {len(story_rows)} stories on page {page_num}")

            for story_row in story_rows:
                try:
                    # Find the subtext row that follows this story row
                    story_id = await loop.run_in_executor(
                        None, lambda: story_row.get_attribute("id")
                    )

                    # Use XPath to find the following tr that contains the subtext
                    subtext_xpath = f"//tr[@id='{story_id}']/following-sibling::tr[1]"
                    subtext_row = await loop.run_in_executor(
                        None, lambda: driver.find_element(By.XPATH, subtext_xpath)
                    )

                    if await loop.run_in_executor(
                        None,
                        lambda: subtext_row.find_elements(By.CSS_SELECTOR, ".subtext"),
                    ):
                        story_data = await loop.run_in_executor(
                            None,
                            lambda: self._extract_story_data(story_row, subtext_row),
                        )
                        page_stories.append(story_data)
                except Exception as e:
                    self.logger.warning(
                        f"Failed to extract story data for an item: {e}"
                    )
                    continue

        except Exception as e:
            self.logger.error(f"Error processing page {page_num}: {e}")
            raise
        finally:
            # Clean up the driver
            if driver:
                try:
                    await loop.run_in_executor(None, driver.quit)
                    self.logger.debug(f"Driver for page {page_num} closed successfully")
                except Exception as e:
                    self.logger.warning(
                        f"Error closing driver for page {page_num}: {e}"
                    )

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

    # Método específico para facilitar testing con FastAPI
    async def __aenter__(self):
        """
        Async context manager entry point - for use with FastAPI testing.
        """
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """
        Async context manager exit point - for use with FastAPI testing.
        """
        # Cleaning up resources is already handled in the individual methods
        pass
