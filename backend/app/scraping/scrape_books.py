#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para hacer web scraping asíncrono de una página de libros y guardar los datos en Redis.
"""

import aiohttp
import asyncio
from bs4 import BeautifulSoup
import logging
import hashlib
import os
from typing import List, Dict, Optional
import re
from urllib.parse import urljoin
from dotenv import load_dotenv

from app.services.redis_service import RedisService
from app.models.schemas import Book

load_dotenv()


class BookScraper:
    """Clase para hacer scraping asíncrono de libros de un sitio web de prueba."""

    def __init__(
        self,
        base_url: str,
        redis_service: RedisService = None,
        max_books: int = 100,
        price_limit: float = 20.0,
        logs_dir: str = "logs",
        max_concurrent_requests: int = 5,
    ):
        """
        Inicializa el scraper con la URL base y configuración de Redis.

        Args:
            base_url: URL base del sitio web a scrapear
            redis_host: Host donde se ejecuta Redis
            redis_port: Puerto de Redis
            max_books: Número máximo de libros a scrapear
            price_limit: Precio máximo de los libros a scrapear (en libras)
            logs_dir: Directorio para logs
            max_concurrent_requests: Número máximo de solicitudes concurrentes
        """
        self.base_url = base_url
        self.redis_service = redis_service
        self.max_books = max_books
        self.price_limit = price_limit
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        }
        self.max_concurrent_requests = max_concurrent_requests
        self.semaphore = asyncio.Semaphore(max_concurrent_requests)
        self.total_books_collected = 0
        self.book_collection_lock = asyncio.Lock()
        self.logs_dir = logs_dir

        # Configuración del logger
        os.makedirs(self.logs_dir, exist_ok=True)
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(os.path.join(self.logs_dir, "book_scraper.log")),
                logging.StreamHandler(),
            ],
        )
        self.logger = logging.getLogger(__name__)

    def extract_price_value(self, price_text: str) -> float:
        """
        Convierte un texto de precio a un valor flotante.

        Args:
            price_text: Texto con el precio (ej: "£12.99")

        Returns:
            float: Valor del precio
        """
        try:
            # Eliminar símbolo de moneda y convertir a flotante
            price_match = re.search(r"£(\d+\.\d+)", price_text)
            if price_match:
                return float(price_match.group(1))
            return 0.0
        except Exception as e:
            self.logger.error(f"Error al convertir precio '{price_text}': {e}")
            return 0.0

    async def get_page_content(
        self, url: str, session: aiohttp.ClientSession
    ) -> Optional[BeautifulSoup]:
        """
        Obtiene el contenido HTML de una página y lo devuelve como un objeto BeautifulSoup.

        Args:
            url: URL de la página a scrapear
            session: Sesión aiohttp activa

        Returns:
            BeautifulSoup: Objeto con el contenido de la página o None si hay error
        """
        async with self.semaphore:
            try:
                async with session.get(
                    url, headers=self.headers, timeout=10
                ) as response:
                    response.raise_for_status()
                    html = await response.text()
                    return BeautifulSoup(html, "html.parser")
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                self.logger.error(f"Error al obtener la página {url}: {e}")
                return None

    async def get_categories(
        self, session: aiohttp.ClientSession
    ) -> List[Dict[str, str]]:
        """
        Extrae la información de las categorías

        Args:
            session: Sesión aiohttp activa

        Returns:
            List[Dict[str, str]]: Lista de diccionarios con nombre y URL de categorías
        """
        categories = []
        try:
            soup = await self.get_page_content(self.base_url, session)
            if not soup:
                return []

            # Navega a la sección de categorías
            nav_soup = soup.select_one("div.side_categories > ul > li > ul")
            for category_item in nav_soup.find_all("li"):
                link = category_item.select_one("a")
                if link:
                    category_name = link.text.strip()
                    category_url = urljoin(self.base_url, link["href"])
                    categories.append({"name": category_name, "url": category_url})

            self.logger.info(f"Se encontraron {len(categories)} categorías")
            return categories
        except Exception as e:
            self.logger.error(f"Error al extraer las categorías: {e}")
            return []

    def extract_books_from_page(self, soup: BeautifulSoup, category: str) -> List[Book]:
        """
        Extrae la información de los libros de una página.

        Args:
            soup: Objeto BeautifulSoup con el contenido de la página
            category: Categoría de los libros

        Returns:
            List[Book]: Lista de objetos Book
        """
        books = []
        try:
            for book_soup in soup.select("article.product_pod"):
                # Extraer título
                title_element = book_soup.select_one("h3 a")
                title = title_element.get("title", title_element.text.strip())

                # Extraer y convertir precio
                price_text = book_soup.select_one(".price_color").text.strip()
                price = self.extract_price_value(price_text)

                # Solo incluir libros por debajo del precio límite
                if price > self.price_limit:
                    continue

                # Crear URL completa de la imagen
                image_element = book_soup.select_one(".image_container img")
                relative_image_url = image_element.get("src", "")
                image_url = urljoin(self.base_url, relative_image_url)

                book_id = hashlib.md5(title.encode()).hexdigest()

                book = Book(
                    id=book_id,
                    title=title,
                    price=price,
                    category=category,
                    image_url=image_url,
                )
                books.append(book)

            return books
        except Exception as e:
            self.logger.error(f"Error al extraer los libros: {e}")
            return []

    def get_next_page_url(self, soup: BeautifulSoup, current_url: str) -> Optional[str]:
        """
        Obtiene la URL de la siguiente página si existe.

        Args:
            soup: Objeto BeautifulSoup con el contenido de la página actual
            current_url: URL de la página actual

        Returns:
            Optional[str]: URL de la siguiente página o None si no hay más páginas
        """
        try:
            next_button = soup.select_one("li.next > a")
            if next_button:
                next_url = next_button.get("href")
                # Construir URL completa
                return urljoin(current_url, next_url)
            return None
        except Exception as e:
            self.logger.error(f"Error al obtener la URL de la siguiente página: {e}")
            return None

    async def save_to_redis(self, book: Book) -> bool:
        """
        Guarda los datos de un libro utilizando el RedisService.

        Args:
            book: Objeto Book con los datos del libro

        Returns:
            bool: True si se guardó correctamente, False en caso contrario
        """
        try:
            if self.redis_service:
                return await self.redis_service.store_book(book)
            else:
                self.logger.warning("No hay servicio Redis configurado")
                return False
        except Exception as e:
            self.logger.error(f"Error al guardar en Redis: {e}")
            return False

    async def process_page(
        self,
        url: str,
        category_name: str,
        session: aiohttp.ClientSession,
        all_books: List[Book],
    ) -> Dict:
        """
        Procesa una página individual de una categoría.

        Args:
            url: URL de la página
            category_name: Nombre de la categoría
            session: Sesión aiohttp
            redis_client: Cliente de Redis asíncrono
            all_books: Lista de todos los libros recopilados

        Returns:
            Dict: Diccionario con libros encontrados y próxima URL
        """
        # Obtener contenido de la página
        soup = await self.get_page_content(url, session)
        if not soup:
            return {"books": [], "next_url": None}

        # Extraer libros de la página
        page_books = self.extract_books_from_page(soup, category_name)

        # Determinar la URL de la siguiente página
        next_url = self.get_next_page_url(soup, url)

        return {"books": page_books, "next_url": next_url}

    async def scrape_category(
        self,
        category_data: Dict[str, str],
        session: aiohttp.ClientSession,
        all_books: List[Book],
    ) -> None:
        """
        Realiza el scraping de una categoría, navegando por sus páginas.

        Args:
            category_data: Diccionario con nombre y URL de la categoría
            session: Sesión aiohttp activa
            redis_client: Cliente de Redis asíncrono
            all_books: Lista compartida para almacenar todos los libros
        """
        category_name = category_data["name"]
        url = category_data["url"]
        self.logger.info(f"Iniciando scraping de la categoría: {category_name}")

        page_num = 1

        while url:
            self.logger.info(
                f"Procesando página {page_num} de la categoría {category_name}"
            )

            async with self.book_collection_lock:
                # Verificar si ya alcanzamos el límite global de libros
                if self.total_books_collected >= self.max_books:
                    break

            # Procesar página
            result = await self.process_page(
                url, category_name, session, all_books
            )
            page_books = result["books"]

            if not page_books:
                break

            # Actualizar contador global y libros recopilados
            async with self.book_collection_lock:
                # Determinar cuántos libros podemos agregar sin exceder el límite
                remaining_slots = self.max_books - self.total_books_collected

                if remaining_slots <= 0:
                    break

                # Tomar solo los libros necesarios
                books_to_add = page_books[:remaining_slots]

                # Guardar libros en Redis y en la lista
                for book in books_to_add:
                    await self.save_to_redis(book)
                    all_books.append(book)

                self.total_books_collected += len(books_to_add)

                # Si no pudimos agregar todos los libros, hemos alcanzado el límite
                if len(books_to_add) < len(page_books):
                    break

            # Avanzar a la siguiente página
            url = result["next_url"]
            page_num += 1

            # Pequeña pausa para no sobrecargar el servidor
            await asyncio.sleep(0.2)

        self.logger.info(f"Scraping completo para la categoría {category_name}.")

    async def scrape_books(self) -> List[Book]:
        """
        Realiza el scraping completo de libros por categorías hasta alcanzar el límite.

        Returns:
            List[Book]: Lista de libros scrapeados
        """
        all_books = []

        try:
            # Crear una sesión HTTP
            timeout = aiohttp.ClientTimeout(total=30)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                # Obtener categorías
                categories = await self.get_categories(session)
                if not categories:
                    self.logger.error("No se pudieron obtener las categorías")
                    return []

                # Crear tareas para scraping de cada categoría
                tasks = []
                for category_data in categories:
                    task = asyncio.create_task(
                        self.scrape_category(
                            category_data, session, all_books
                        )
                    )
                    tasks.append(task)

                # Esperar a que todas las tareas terminen
                await asyncio.gather(*tasks)

            self.logger.info(
                f"Scraping completado. Total de libros recopilados: {len(all_books)}"
            )
            return all_books
        except Exception as e:
            self.logger.error(f"Error durante el proceso de scraping: {e}")
            return all_books
