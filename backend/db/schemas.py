# backend/db/schemas.py

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ---------------------------
# Movie Schemas
# ---------------------------
class MovieBase(BaseModel):
    movie_id: int
    title: str
    genres: Optional[str] = None
    poster_url: Optional[str] = None
    description: Optional[str] = None
    release_year: Optional[int] = None
    metadata_json: Optional[dict] = None


class MovieCreate(BaseModel):
    movie_id: int
    title: str
    genres: Optional[str]
    poster_url: Optional[str]
    description: Optional[str]
    release_year: Optional[int]
    metadata_json: Optional[dict]


class MovieResponse(MovieBase):
    class Config:
        from_attributes = True


# ---------------------------
# User Schemas
# ---------------------------
class UserBase(BaseModel):
    name: Optional[str]
    email: str
    age: Optional[int]
    location: Optional[str]


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------
# Event Schemas
# ---------------------------
class EventCreate(BaseModel):
    movie_id: int
    event_type: str       # "watched" or "rated"
    rating: Optional[float] = None
    watched_at: Optional[datetime] = None   # null for past watches


class EventResponse(BaseModel):
    event_id: int
    movie_id: int
    event_type: str
    rating: Optional[float]
    watched_at: Optional[datetime]
    created_at: datetime
    movie: Optional[MovieResponse] = None   # include movie metadata for frontend

    class Config:
        from_attributes = True


# ---------------------------
# User History Response
# ---------------------------
class UserHistory(BaseModel):
    user: UserResponse
    events: List[EventResponse]
