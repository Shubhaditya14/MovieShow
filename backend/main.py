from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, movies, interactions, recommend, similar, metadata, batch

app = FastAPI(title="Movie Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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