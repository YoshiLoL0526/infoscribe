from typing import List, Optional
from pydantic import BaseModel, Field


class BookBase(BaseModel):
    title: str
    price: float = Field(..., gt=0)
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class Book(BookBase):
    id: str

    class Config:
        from_attributes = True


class BookCreate(BookBase):
    pass


class BookSearch(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None


class Headline(BaseModel):
    title: str
    url: str
    score: Optional[int] = None


class HeadlineList(BaseModel):
    headlines: List[Headline]
