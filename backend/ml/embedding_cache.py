# backend/ml/embedding_cache.py

import os
import json
import aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.models import UserMovieEvent


# ------------------------------
# Redis Connection
# ------------------------------
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

redis = None


async def get_redis():
    global redis
    if redis is None:
        redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
    return redis


# ------------------------------
# Compute User Embedding (TEMP)
# Later: call Transformer + taste model
# ------------------------------
async def compute_user_embedding(user_id: int, db: AsyncSession):
    """
    TEMPORARY PLACEHOLDER:
    This will be replaced with real:
    - sequence embedding
    - taste embedding
    - Transformer encoding
    """
    # Fetch events
    result = await db.execute(
        select(UserMovieEvent)
        .where(UserMovieEvent.user_id == user_id)
        .order_by(UserMovieEvent.watched_at.asc().nulls_last())
    )
    events = result.scalars().all()

    # Debug placeholder embedding
    # Later: replace with real vectors from your model
    seq_ids = [e.movie_id for e in events if e.watched_at is not None]
    taste_ids = [e.movie_id for e in events if e.watched_at is None]

    fake_embedding = {
        "sequence_ids": seq_ids,
        "taste_ids": taste_ids,
        "vector": [0.0] * 128  # placeholder for real embedding
    }

    return fake_embedding


# ------------------------------
# Update Redis Cache
# ------------------------------
async def update_user_embedding_cache(user_id: int, db: AsyncSession):
    redis = await get_redis()
    embedding = await compute_user_embedding(user_id, db)
    await redis.set(f"user_emb:{user_id}", json.dumps(embedding))


# ------------------------------
# Retrieve from Redis
# ------------------------------
async def get_user_embedding(user_id: int):
    redis = await get_redis()
    data = await redis.get(f"user_emb:{user_id}")
    
    if data:
        return json.loads(data)
    return None
