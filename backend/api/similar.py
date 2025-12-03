from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

import torch
import torch.nn.functional as F

from ml.inference import load_model

# load the same model + vocab at startup
model, vocab, device = load_model()

router = APIRouter()


class SimilarRequest(BaseModel):
    movie_id: str
    top_k: int = 20


class SimilarResponse(BaseModel):
    movie_id: str
    similar: List[dict]


@router.post("/similar", response_model=SimilarResponse)
async def similar_items(req: SimilarRequest):
    movie_id = req.movie_id

    movie_to_idx = vocab["movie_id_to_index"]
    idx_to_movie = vocab["index_to_movie_id"]

    if movie_id not in movie_to_idx:
        raise HTTPException(404, f"Movie {movie_id} not found in vocab.")

    # get index
    idx = movie_to_idx[movie_id]

    # get embedding for this movie
    with torch.no_grad():
        item_emb = model.item_embedding.weight.detach()    # [num_items, d]
        query_vec = item_emb[idx].unsqueeze(0)             # [1, d]

        # L2 normalize for cosine similarity
        item_norm = F.normalize(item_emb, dim=1)
        query_norm = F.normalize(query_vec, dim=1)

        # similarity scores (cosine similarity)
        scores = torch.matmul(item_norm, query_norm.T).squeeze(1)   # [num_items]

        # remove itself
        scores[idx] = -999

        # top-K
        top_scores, top_indices = torch.topk(scores, req.top_k)

    results = []
    for score, movie_idx in zip(top_scores.tolist(), top_indices.tolist()):
        movie_id_out = idx_to_movie[str(movie_idx)]
        results.append({
            "movie_id": movie_id_out,
            "similarity": float(score)
        })

    return SimilarResponse(
        movie_id=movie_id,
        similar=results
    )
