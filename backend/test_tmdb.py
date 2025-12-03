import asyncio
from services.tmdb import tmdb_service

async def test():
    print("Testing TMDB Service...")
    # Test with a known movie
    movie = await tmdb_service.get_movie_details("The Matrix", 1999)
    print(f"Result for 'The Matrix': {movie}")
    
    if movie and movie.get('poster_url'):
        print(f"SUCCESS: Poster URL found: {movie['poster_url']}")
    else:
        print("FAILURE: No poster URL found")

    await tmdb_service.close()

if __name__ == "__main__":
    asyncio.run(test())
