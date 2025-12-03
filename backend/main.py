from fastapi import FastAPI
from backend.api import auth, movies, interactions, recommend, similar, metadata, batch

app = FastAPI(title="Movie Recommender API")

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(interactions.router)
app.include_router(recommend.router)
app.include_router(similar.router)
app.include_router(metadata.router)
app.include_router(batch.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Movie Recommendation API"}