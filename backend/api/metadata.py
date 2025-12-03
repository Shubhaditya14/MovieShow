from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ml.inference import load_model, recommend
from db.database import get_db
from db.models import Movie

# load once at startup
model, vocab, device = load_model()

router = APIRouter()


class MetadataFilterRequest(BaseModel):
    user_id: int
    history: List[str]     # list of movie_ids watched in order
    top_k: int = 50        # get more initially, then filter
    genres: Optional[List[str]] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    final_k: int = 20      # return this many after filtering


class MetadataFilterResponse(BaseModel):
    user_id: int
    recommendations: List[dict]
    filters_applied: dict


@router.post("/recommend/filtered", response_model=MetadataFilterResponse)
async def recommend_with_filters(req: MetadataFilterRequest, db: AsyncSession = Depends(get_db)):
    if len(req.history) == 0:
        raise HTTPException(400, "User history is empty")

    # Get initial recommendations (more than needed)
    recs = recommend(
        model=model,
        vocab=vocab,
        device=device,
        user_history=req.history,
        top_k=req.top_k
    )

    # Extract movie IDs from recommendations
    movie_ids = [r["movie_id"] for r in recs]

    # Fetch metadata from database
    result = await db.execute(
        select(Movie).where(Movie.movie_id.in_(movie_ids))
    )
    movies = {str(m.movie_id): m for m in result.scalars().all()}

    # Apply filters
    filtered_recs = []
    for rec in recs:
        movie_id = rec["movie_id"]
        
        # Skip if movie not in DB
        if movie_id not in movies:
            continue
            
        movie = movies[movie_id]
        
        # Genre filter
        if req.genres:
            movie_genres = movie.genres if movie.genres else []
            if not any(g in movie_genres for g in req.genres):
                continue
        
        # Year filter
        if req.min_year and movie.year and movie.year < req.min_year:
            continue
        if req.max_year and movie.year and movie.year > req.max_year:
            continue
        
        # Add metadata to recommendation
        filtered_recs.append({
            "movie_id": movie_id,
            "score": rec["score"],
            "title": movie.title,
            "genres": movie.genres,
            "year": movie.year,
            "poster_url": movie.poster_url
        })
        
        # Stop when we have enough
        if len(filtered_recs) >= req.final_k:
            break

    filters_applied = {
        "genres": req.genres,
        "min_year": req.min_year,
        "max_year": req.max_year
    }

    return MetadataFilterResponse(
        user_id=req.user_id,
        recommendations=filtered_recs,
        filters_applied=filters_applied
    )
