from fastapi import APIRouter, Depends

from app.models.schemas import HeadlineList
from app.services.headlines_service import HackerNewsIntegration, get_headlines_service

router = APIRouter()


@router.get(
    "/headlines",
    response_model=HeadlineList,
    summary="Obtiene titulares actuales de Hacker News",
)
async def get_headlines(
    service: HackerNewsIntegration = Depends(get_headlines_service)
):
    """
    Endpoint en tiempo real que obtiene los titulares actuales de Hacker News.
    """
    headlines = await service.fetch_top_stories()
    return HeadlineList(headlines=headlines)
