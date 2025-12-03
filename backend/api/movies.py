from fastapi import APIRouter, HTTPException
from services.tmdb import tmdb_service
from utils.data_loader import get_movie_title, load_movie_titles
import re

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("/{movie_id}")
async def get_movie_details(movie_id: str):
    # Try to get title from our CSV
    title = get_movie_title(movie_id)
    
    # If movie not in our database, check if it's a known TMDB ID
    # For demo purposes, we'll use some hardcoded mappings
    tmdb_fallback = {
        "318": "The Shawshank Redemption (1994)",
        "858": "The Godfather (1972)",
        "58559": "The Dark Knight (2008)",
        "296": "Pulp Fiction (1994)",
        "356": "Forrest Gump (1994)",
        "27205": "Inception (2010)",
        "550": "Fight Club (1999)",
        "2571": "The Matrix (1999)",
        "769": "Goodfellas (1990)",
        "593": "The Silence of the Lambs (1991)",
        "157336": "Interstellar (2014)",
        "496243": "Parasite (2019)",
    }
    
    # If not in our CSV, try the fallback
    if title == f"Movie {movie_id}" and movie_id in tmdb_fallback:
        title = tmdb_fallback[movie_id]
    
    # Extract year from title if present "Toy Story (1995)"
    year = None
    clean_title = title
    match = re.search(r'\((\d{4})\)', title)
    if match:
        year = int(match.group(1))
        clean_title = re.sub(r'\(\d{4}\)', '', title).strip()

    # Fetch details from TMDB
    tmdb_data = await tmdb_service.get_movie_details(clean_title, year)
    
    return {
        "movie_id": movie_id,
        "title": title,
        "clean_title": clean_title,
        "year": year,
        "poster_url": tmdb_data.get("poster_url"),
        "backdrop_url": tmdb_data.get("backdrop_url"),
        "overview": tmdb_data.get("overview"),
        "rating": tmdb_data.get("vote_average"),
        "release_date": tmdb_data.get("release_date"),
        "genres": ["Action", "Adventure"] # Placeholder, ideally from CSV or TMDB
    }
