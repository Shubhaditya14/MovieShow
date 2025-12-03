import os
import httpx
from functools import lru_cache

# Hardcoded for now since .env is ignored, but normally we'd load this
TMDB_API_KEY = "ce3c7045a1ae5017a3e36d1a51d72bc2"
BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

class TMDBService:
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=BASE_URL, params={"api_key": TMDB_API_KEY})

    async def get_movie_details(self, title: str, year: int = None):
        """
        Search for a movie by title (and optional year) to get its poster and details.
        """
        try:
            params = {"query": title}
            if year:
                params["year"] = year
            
            response = await self.client.get("/search/movie", params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["results"]:
                movie = data["results"][0]
                return {
                    "tmdb_id": movie["id"],
                    "title": movie["title"],
                    "overview": movie["overview"],
                    "poster_url": f"{IMAGE_BASE_URL}{movie['poster_path']}" if movie.get("poster_path") else None,
                    "backdrop_url": f"{IMAGE_BASE_URL}{movie['backdrop_path']}" if movie.get("backdrop_path") else None,
                    "release_date": movie.get("release_date"),
                    "vote_average": movie.get("vote_average"),
                }
            return None
        except Exception as e:
            print(f"Error fetching TMDB data for {title}: {e}")
            return None

    async def close(self):
        await self.client.aclose()

# Singleton instance
tmdb_service = TMDBService()
