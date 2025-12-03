from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from ml.inference import load_model, recommend

# load once at startup
model, vocab, device = load_model()

router = APIRouter()


class RecommendRequest(BaseModel):
    user_id: int
    history: List[str]     # list of movie_ids watched in order
    top_k: int = 20


class RecommendResponse(BaseModel):
    user_id: int
    recommendations: List[dict]


@router.post("/recommend", response_model=RecommendResponse)
async def recommend_movies(req: RecommendRequest):
    if len(req.history) == 0:
        raise HTTPException(400, "User history is empty")

    recs = recommend(
        model=model,
        vocab=vocab,
        device=device,
        user_history=req.history,
        top_k=req.top_k
    )

    return RecommendResponse(
        user_id=req.user_id,
        recommendations=recs
    )
