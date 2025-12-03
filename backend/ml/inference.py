# backend/ml/inference.py

import json
import torch
import torch.nn.functional as F
from pathlib import Path
import numpy as np
import redis

from ml.model import TransformerRecModel


# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
CHECKPOINT_PATH = Path(__file__).parent.parent.parent / "model_checkpoints" / "transformer_epoch1.pt"
VOCAB_PATH = Path(__file__).parent.parent.parent / "data" / "vocab.json"
MAX_SEQ_LEN = 50
REDIS_ENABLED = True   # Enabled for production speedup
REDIS_HOST = "localhost"
REDIS_PORT = 6379


# ---------------------------------------------------------
# REDIS CLIENT (optional)
# ---------------------------------------------------------
redis_client = None
if REDIS_ENABLED:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=False)


# ---------------------------------------------------------
# LOAD MODEL + VOCAB + CONFIG
# ---------------------------------------------------------
def load_model(device=None):
    if device is None:
        if torch.backends.mps.is_available():
            device = torch.device("mps")
        elif torch.cuda.is_available():
            device = torch.device("cuda")
        else:
            device = torch.device("cpu")

    print(f"Loading model on: {device}")

    # load checkpoint
    ckpt = torch.load(CHECKPOINT_PATH, map_location=device)

    vocab = ckpt["vocab"]
    config = ckpt["config"]

    num_items = config["num_items"]
    d_model = config["d_model"]
    n_heads = config["n_heads"]
    n_layers = config["n_layers"]
    max_seq_len = config["max_seq_len"]
    pad_idx = config["pad_idx"]

    model = TransformerRecModel(
        num_items=num_items,
        d_model=d_model,
        n_heads=n_heads,
        n_layers=n_layers,
        max_seq_len=max_seq_len,
        pad_idx=pad_idx,
    ).to(device)

    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()

    print("Model loaded successfully.")
    return model, vocab, device



# ---------------------------------------------------------
# UTILS: Convert movie IDs → indices with vocab
# ---------------------------------------------------------
def to_idx_list(movie_ids, movie_to_idx):
    out = []
    for m in movie_ids:
        s = str(m)
        if s in movie_to_idx:
            out.append(movie_to_idx[s])
    return out



# ---------------------------------------------------------
# BUILD USER EMBEDDING
# ---------------------------------------------------------
def compute_user_embedding(model, vocab, device, user_history):
    """
    user_history: list of movie_ids in chronological order
    returns: user_embedding [128]
    """

    movie_to_idx = vocab["movie_id_to_index"]
    pad_idx = vocab["pad_index"]

    # convert movie_ids → embedding indices
    idxs = to_idx_list(user_history, movie_to_idx)

    # split into taste (old) + recent (sequence)
    if len(idxs) > MAX_SEQ_LEN + 1:
        taste_items = idxs[: -(MAX_SEQ_LEN + 1)]
        recent_items = idxs[-(MAX_SEQ_LEN + 1) :]
    else:
        taste_items = []
        recent_items = idxs

    # build sequence and pad left
    seq = recent_items[:-1]   # all except last → prefix
    target = recent_items[-1] # not actually used here but consistent

    # pad left
    if len(seq) >= MAX_SEQ_LEN:
        seq = seq[-MAX_SEQ_LEN:]
    else:
        seq = [pad_idx] * (MAX_SEQ_LEN - len(seq)) + seq

    # convert to tensor
    seq_tensor = torch.tensor([seq], dtype=torch.long, device=device)
    attn_mask = (seq_tensor != pad_idx).long()

    taste_tensor = torch.tensor([taste_items], dtype=torch.long, device=device)

    # dummy candidate for forward pass
    dummy_candidate = torch.tensor([[target]], dtype=torch.long, device=device)

    # run the model to get user embedding BEFORE scoring
    with torch.no_grad():
        # we modify model.forward temporarily to expose user vector
        # or we call internal functions if we refactor
        # easiest way: monkey patch the scoring call and extract the user vector
        out = model(
            sequence=seq_tensor,
            attention_mask=attn_mask,
            taste=taste_tensor,
            candidate_items=dummy_candidate,
        )

        # model internally computes:
        # seq_user_emb + taste_user_emb → user_emb (before dot product)
        # so extract it manually from model internals

        # We replicate internal logic to compute user embedding cleanly:

        # Recompute item embeddings
        seq_emb = model.item_embedding(seq_tensor)
        pos_ids = torch.arange(seq_tensor.size(1), device=device).unsqueeze(0)
        pos_emb = model.position_embedding(pos_ids)
        seq_emb = seq_emb + pos_emb

        src_key_padding_mask = (seq_tensor == pad_idx)
        seq_out = model.transformer(seq_emb, src_key_padding_mask=src_key_padding_mask)

        seq_user_emb = seq_out[:, -1, :]  # [1, d]

        # taste embedding
        if len(taste_items) == 0:
            taste_user_emb = torch.zeros_like(seq_user_emb)
        else:
            t_emb = model.item_embedding(taste_tensor)  # [1, T, d]
            taste_mask = (taste_tensor != pad_idx).float().unsqueeze(-1)
            t_sum = (t_emb * taste_mask).sum(dim=1)
            t_count = taste_mask.sum(dim=1).clamp(min=1.0)
            taste_user_emb = t_sum / t_count  # [1, d]

        # fuse
        user_emb = model.user_proj(seq_user_emb + taste_user_emb)  # [1, d]

        return user_emb.squeeze(0)  # [d_model]



# ---------------------------------------------------------
# TOP-K RECOMMENDATION
# ---------------------------------------------------------
def recommend(model, vocab, device, user_history, top_k=20):
    """
    user_history: list of movie_ids in chronological order
    returns: list of (movie_id, score)
    """

    user_emb = compute_user_embedding(model, vocab, device, user_history)  # [128]

    movie_to_idx = vocab["movie_id_to_index"]
    idx_to_movie = vocab["index_to_movie_id"]

    num_items = len(movie_to_idx) + 1   # because index starts at 1

    # get all item embeddings
    all_item_indices = torch.arange(1, num_items, device=device)
    all_item_emb = model.item_embedding(all_item_indices)  # [N, 128]

    # compute scores via dot product
    scores = torch.matmul(all_item_emb, user_emb)  # [N]

    # get top-K
    top_scores, top_indices = torch.topk(scores, top_k)

    results = []
    for score, idx in zip(top_scores.tolist(), top_indices.tolist()):
        movie_id = idx_to_movie[str(idx)]
        results.append({"movie_id": movie_id, "score": score})

    return results



# ---------------------------------------------------------
# OPTIONAL REDIS CACHING
# ---------------------------------------------------------
def get_user_embedding_cached(model, vocab, device, user_id, user_history):
    key = f"user:{user_id}:embedding"

    if REDIS_ENABLED:
        cached = redis_client.get(key)
        if cached is not None:
            arr = np.frombuffer(cached, dtype=np.float32)
            return torch.tensor(arr, device=device)

    emb = compute_user_embedding(model, vocab, device, user_history)

    if REDIS_ENABLED:
        redis_client.set(key, emb.cpu().numpy().tobytes())

    return emb
