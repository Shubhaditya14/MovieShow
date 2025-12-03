from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ml.inference import recommend, load_model
from services.tmdb import tmdb_service
import asyncio

router = APIRouter()

# Load model on startup
try:
    model, vocab, user_embeddings = load_model()
    print("Model loaded successfully in API")
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None

class RecommendRequest(BaseModel):
    user_id: int
    history: List[str]  # List of movie IDs
    top_k: int = 10

class MovieResponse(BaseModel):
    movie_id: str
    title: str
    score: float
    poster_url: Optional[str] = None
    overview: Optional[str] = None
    year: Optional[str] = None
    rating: Optional[float] = None

class RecommendResponse(BaseModel):
    user_id: int
    recommendations: List[MovieResponse]

@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendations(request: RecommendRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Get raw recommendations (IDs and scores)
    recs = recommend(
        model=model,
        vocab=vocab,
        user_history=request.history,
        k=request.top_k,
        user_embeddings=user_embeddings,
        user_id=request.user_id
    )
    
    # Load movie titles mapping
    # In production this would be in a DB or loaded once at startup
    import pandas as pd
    from pathlib import Path
    
    MOVIES_CSV_PATH = Path(__file__).parent.parent.parent / "data" / "movielens_raw" / "movies.csv"
    
    # Simple cache for titles to avoid reloading CSV every request (in prod use DB)
    if not hasattr(get_recommendations, "movie_titles"):
        try:
            df = pd.read_csv(MOVIES_CSV_PATH)
            get_recommendations.movie_titles = dict(zip(df['movieId'].astype(str), df['title']))
            print(f"Loaded {len(get_recommendations.movie_titles)} movie titles")
        except Exception as e:
            print(f"Error loading movies.csv: {e}")
            get_recommendations.movie_titles = {}

    enriched_recs = []
    
    for movie_id, score in recs:
        title = get_recommendations.movie_titles.get(str(movie_id), f"Movie {movie_id}")
        
        # Extract year from title if present "Toy Story (1995)"
        year = None
        clean_title = title
        import re
        match = re.search(r'\((\d{4})\)', title)
        if match:
            year = int(match.group(1))
            clean_title = re.sub(r'\(\d{4}\)', '', title).strip()

        # Fetch details from TMDB
        tmdb_data = await tmdb_service.get_movie_details(clean_title, year)
        
        movie_data = {
            "movie_id": movie_id,
            "title": title,
            "score": float(score),
            "poster_url": tmdb_data["poster_url"] if tmdb_data else None,
            "overview": tmdb_data["overview"] if tmdb_data else None,
            "year": str(year) if year else None,
            "rating": tmdb_data["vote_average"] if tmdb_data else None
        }
        enriched_recs.append(movie_data)

    return RecommendResponse(
        user_id=request.user_id,
        recommendations=enriched_recs
    )
