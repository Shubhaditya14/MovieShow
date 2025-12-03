from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict

from ml.inference import load_model, recommend

# load once at startup
model, vocab, device = load_model()

router = APIRouter()


class BatchRecommendRequest(BaseModel):
    user_histories: Dict[str, List[str]]  # {user_id: [movie_ids]}
    top_k: int = 20


class BatchRecommendResponse(BaseModel):
    results: Dict[str, List[dict]]  # {user_id: recommendations}
    total_users: int
    success_count: int
    failed_users: List[str]


@router.post("/batch/recommend", response_model=BatchRecommendResponse)
async def batch_recommend_movies(req: BatchRecommendRequest):
    """
    Batch recommendation endpoint for precomputing recommendations.
    
    Use cases:
    - Nightly refresh of user recommendations
    - Homepage feed generation
    - Trending content for all users
    """
    
    results = {}
    failed_users = []
    
    for user_id, history in req.user_histories.items():
        try:
            if len(history) == 0:
                failed_users.append(user_id)
                continue
            
            recs = recommend(
                model=model,
                vocab=vocab,
                device=device,
                user_history=history,
                top_k=req.top_k
            )
            
            results[user_id] = recs
            
        except Exception as e:
            print(f"Failed to generate recommendations for user {user_id}: {e}")
            failed_users.append(user_id)
    
    return BatchRecommendResponse(
        results=results,
        total_users=len(req.user_histories),
        success_count=len(results),
        failed_users=failed_users
    )


@router.post("/batch/recommend/cache")
async def batch_recommend_and_cache(req: BatchRecommendRequest):
    """
    Batch recommendation with Redis caching.
    
    This endpoint:
    1. Generates recommendations for all users
    2. Caches them in Redis with TTL
    3. Returns summary stats
    """
    
    from ml.inference import REDIS_ENABLED, redis_client
    import json
    
    if not REDIS_ENABLED:
        raise HTTPException(400, "Redis caching is not enabled")
    
    results = {}
    cached_count = 0
    failed_users = []
    
    for user_id, history in req.user_histories.items():
        try:
            if len(history) == 0:
                failed_users.append(user_id)
                continue
            
            recs = recommend(
                model=model,
                vocab=vocab,
                device=device,
                user_history=history,
                top_k=req.top_k
            )
            
            # Cache in Redis with 24h TTL
            cache_key = f"recs:user:{user_id}"
            redis_client.setex(
                cache_key,
                86400,  # 24 hours
                json.dumps(recs)
            )
            
            cached_count += 1
            results[user_id] = len(recs)
            
        except Exception as e:
            print(f"Failed for user {user_id}: {e}")
            failed_users.append(user_id)
    
    return {
        "total_users": len(req.user_histories),
        "cached_count": cached_count,
        "failed_count": len(failed_users),
        "failed_users": failed_users[:10]  # show first 10
    }
