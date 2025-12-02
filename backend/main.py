from fastapi import FastAPI
from backend.api import auth, movies, interactions, recommend

app = FastAPI()

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(interactions.router)
app.include_router(recommend.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Movie Recommendation API"}
