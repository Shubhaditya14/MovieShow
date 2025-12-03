import pandas as pd
from pathlib import Path

_movie_titles = {}

def load_movie_titles():
    global _movie_titles
    if _movie_titles:
        return _movie_titles
        
    try:
        movies_path = Path(__file__).parent.parent / "data" / "movielens_raw" / "movies.csv"
        df = pd.read_csv(movies_path)
        # Ensure movie IDs are strings
        _movie_titles = {str(mid): title for mid, title in zip(df['movieId'], df['title'])}
        print(f"Loaded {len(_movie_titles)} movie titles")
    except Exception as e:
        print(f"Error loading movies.csv: {e}")
        _movie_titles = {}
        
    return _movie_titles

def get_movie_title(movie_id: str) -> str:
    titles = load_movie_titles()
    return titles.get(str(movie_id), f"Movie {movie_id}")
