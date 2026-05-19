from typing import Generic, TypeVar

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    error_code: str
    message: str


T = TypeVar("T")


class PageResponse(BaseModel, Generic[T]):
    items: list[T] = Field(default_factory=list)
    page: int
    page_size: int
    total: int
