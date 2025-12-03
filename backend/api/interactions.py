# backend/api/interactions.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from db.database import get_db
from db.models import User, Movie, UserMovieEvent
from db.schemas import EventCreate, EventResponse
from utils.jwt_handler import get_current_user_id
from services.omdb_service import fetch_movie_from_omdb

# Redis cache updater (we'll implement it soon)
from ml.embedding_cache import update_user_embedding_cache


router = APIRouter(prefix="/interactions", tags=["Interactions"])


# ---------------------------
# Ensure movie exists locally
# ---------------------------
async def ensure_movie_in_db(movie_id: int, db: AsyncSession):
    result = await db.execute(select(Movie).where(Movie.movie_id == movie_id))
    movie = result.scalar_one_or_none()

    if movie:
        return movie

    # Fetch from OMDb
    omdb_data = await fetch_movie_from_omdb(imdb_id=f"tt{movie_id}")

    new_movie = Movie(
        movie_id=movie_id,
        title=omdb_data.get("Title"),
        genres=omdb_data.get("Genre"),
        poster_url=omdb_data.get("Poster"),
        description=omdb_data.get("Plot"),
        release_year=int(omdb_data.get("Year", 0)) if omdb_data.get("Year") else None,
        metadata_json=omdb_data,
    )

    db.add(new_movie)
    await db.commit()
    await db.refresh(new_movie)

    return new_movie


# ---------------------------
# Log a watched event
# ---------------------------
@router.post("/watch", response_model=EventResponse)
async def log_watched(
    event: EventCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Ensure movie exists in DB
    await ensure_movie_in_db(event.movie_id, db)

    watched_at = event.watched_at or datetime.utcnow()

    new_event = UserMovieEvent(
        user_id=user_id,
        movie_id=event.movie_id,
        event_type="watched",
        rating=event.rating,
        watched_at=watched_at,
    )

    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)

    # Update Redis embedding cache
    await update_user_embedding_cache(user_id, db)

    return new_event


# ---------------------------
# Log past watched (no timestamp)
# ---------------------------
@router.post("/past", response_model=EventResponse)
async def log_past_watch(
    event: EventCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Ensure movie exists in DB
    await ensure_movie_in_db(event.movie_id, db)

    new_event = UserMovieEvent(
        user_id=user_id,
        movie_id=event.movie_id,
        event_type="watched",
        rating=event.rating,
        watched_at=None  # important for taste embedding
    )

    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)

    # Update Redis embedding cache
    await update_user_embedding_cache(user_id, db)

    return new_event


# ---------------------------
# Rate a movie
# ---------------------------
@router.post("/rate", response_model=EventResponse)
async def rate_movie(
    event: EventCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    await ensure_movie_in_db(event.movie_id, db)

    new_event = UserMovieEvent(
        user_id=user_id,
        movie_id=event.movie_id,
        event_type="rated",
        rating=event.rating,
        watched_at=None  # ratings do NOT affect sequence
    )

    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)

    # Update Redis embedding cache
    await update_user_embedding_cache(user_id, db)

    return new_event


# ---------------------------
# Get user history (full timeline)
# ---------------------------
@router.get("/history", response_model=list[EventResponse])
async def history(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserMovieEvent)
        .where(UserMovieEvent.user_id == user_id)
        .order_by(UserMovieEvent.watched_at.asc().nulls_last(), UserMovieEvent.created_at.asc())
    )

    events = result.scalars().all()

    return events
