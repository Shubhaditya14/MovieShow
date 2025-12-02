# backend/api/movies.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import Movie
from backend.db.schemas import MovieResponse, MovieCreate
from backend.services.omdb_service import fetch_movie_from_omdb


router = APIRouter(prefix="/movies", tags=["Movies"])


# ---------------------------
# Search (OMDb only)
# ---------------------------
@router.get("/search")
async def search_movies(query: str):
    data = await fetch_movie_from_omdb(title=query)
    return data   # send raw OMDb search result


# ---------------------------
# Get Movie Details (DB + OMDb fallback)
# ---------------------------
@router.get("/{movie_id}", response_model=MovieResponse)
async def get_movie(movie_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(Movie).where(Movie.movie_id == movie_id)
    )
    movie = result.scalar_one_or_none()

    if movie:
        return movie

    # If not in DB, fetch from OMDb
    try:
        omdb_data = await fetch_movie_from_omdb(imdb_id=f"tt{movie_id}")
    except:
        raise HTTPException(404, "Movie not found")

    # Insert into DB
    new_movie = Movie(
        movie_id=movie_id,
        title=omdb_data.get("Title"),
        genres=omdb_data.get("Genre"),
        poster_url=omdb_data.get("Poster"),
        description=omdb_data.get("Plot"),
        release_year=int(omdb_data.get("Year", 0)),
        metadata_json=omdb_data,
    )

    db.add(new_movie)
    await db.commit()
    await db.refresh(new_movie)

    return new_movie
