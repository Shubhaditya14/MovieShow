# backend/api/recommend.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.utils.jwt_handler import get_current_user_id
from backend.db.database import get_db
from backend.db.models import Movie
from backend.ml.embedding_cache import get_user_embedding

router = APIRouter(prefix="/recommend", tags=["Recommendation"])


# ---------------------------
# Dummy Recommendation System
# ---------------------------
@router.get("/")
async def recommend_movies(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # 1. Try to load the cached embedding
    embedding = await get_user_embedding(user_id)

    if embedding is None:
        # no interactions yet
        raise HTTPException(400, "No user embedding found. Log some movies first.")

    # ---------------------------
    # DUMMY RECOMMENDATION LOGIC
    # (Will replace with Transformer later)
    # ---------------------------
    # Let's return the first 10 movies in DB
    result = await db.execute(select(Movie).limit(10))
    movies = result.scalars().all()

    recs = [
        {
            "movie_id": m.movie_id,
            "title": m.title,
            "poster_url": m.poster_url,
            "genres": m.genres
        }
        for m in movies
    ]

    return {
        "user_id": user_id,
        "recommendations": recs,
        "note": "DUMMY DATA — will be replaced by ML model"
    }
