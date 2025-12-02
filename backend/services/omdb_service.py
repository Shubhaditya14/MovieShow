# backend/services/omdb_service.py

import aiohttp
import os
from fastapi import HTTPException
from typing import Optional


OMDB_API_KEY = os.getenv("OMDB_API_KEY")
OMDB_URL = "https://www.omdbapi.com/"


async def fetch_movie_from_omdb(imdb_id: Optional[str] = None, title: Optional[str] = None):
    """
    Fetch full movie metadata from OMDb API.
    You must provide either `imdb_id` or `title`.
    """

    if OMDB_API_KEY is None:
        raise RuntimeError("OMDB_API_KEY not set")

    params = {"apikey": OMDB_API_KEY}

    if imdb_id:
        params["i"] = imdb_id
    elif title:
        params["t"] = title
    else:
        raise HTTPException(400, "Provide either imdb_id or title")

    async with aiohttp.ClientSession() as session:
        async with session.get(OMDB_URL, params=params) as resp:
            if resp.status != 200:
                raise HTTPException(500, "OMDb API failed")

            data = await resp.json()

            if data.get("Response") == "False":
                raise HTTPException(404, f"Movie not found: {data.get('Error')}")

            return data
