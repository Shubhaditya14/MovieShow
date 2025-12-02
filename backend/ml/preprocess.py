# backend/ml/preprocess.py

import pandas as pd
from pathlib import Path
from typing import List, Dict, Any
from collections import Counter
import json
from tqdm import tqdm


# Paths - make them absolute based on project root
PROJECT_ROOT = Path(__file__).parent.parent.parent  # Go up from backend/ml/ to project root
RAW_RATINGS_PATH = PROJECT_ROOT / "data/movielens_raw/ratings.csv"
PROCESSED_DIR = PROJECT_ROOT / "data/movielens_processed"
TRAIN_JSONL_PATH = PROCESSED_DIR / "train.jsonl"
VOCAB_PATH = PROJECT_ROOT / "data/vocab.json"

# Hyperparams / config
RATING_THRESHOLD = 3.5
MAX_SEQ_LEN = 50
MIN_HISTORY_LEN = 3      # min events per user to be useful


def build_vocab(movie_ids: List[int]) -> Dict[str, Any]:
    """
    Build a simple vocab for movie IDs.
    """
    unique_ids = sorted(set(movie_ids))

    # Special tokens (if you want them later)
    # 0 reserved for padding
    id2idx = {int(mid): (i + 1) for i, mid in enumerate(unique_ids)}  # start at 1
    idx2id = {v: k for k, v in id2idx.items()}

    vocab = {
        "movie_id_to_index": id2idx,
        "index_to_movie_id": idx2id,
        "pad_index": 0,
    }
    return vocab


def sliding_window_sequences(
    movie_seq: List[int],
    max_seq_len: int
) -> List[Dict[str, Any]]:
    """
    Given a full chronological sequence of movie_ids for one user,
    generate sliding-window training samples:
    [x1] -> x2
    [x1, x2] -> x3
    ...
    using max_seq_len as truncation length.
    """
    samples = []

    # Need at least 2 items for input->target
    if len(movie_seq) < 2:
        return samples

    # We'll treat the entire history as "recent" for now.
    # Taste items (older stuff) will be handled outside.
    for target_idx in range(1, len(movie_seq)):
        # prefix is all movies before target
        prefix = movie_seq[:target_idx]

        # enforce max_seq_len
        prefix = prefix[-max_seq_len:]

        target = movie_seq[target_idx]

        if len(prefix) == 0:
            continue

        samples.append(
            {
                "sequence": prefix,
                "target": target,
            }
        )

    return samples


def main():
    print(f"Loading ratings from {RAW_RATINGS_PATH} ...")
    df = pd.read_csv(RAW_RATINGS_PATH)

    # Expect columns: userId, movieId, rating, timestamp
    # Filter implicit positives
    df = df[df["rating"] >= RATING_THRESHOLD]

    # Sort by user + timestamp to ensure chronological order
    df = df.sort_values(["userId", "timestamp"])

    # Group by user
    user_groups = df.groupby("userId")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    all_movie_ids = []
    n_users = user_groups.ngroups
    print(f"Total users after filtering: {n_users}")

    # We'll write out JSONL incrementally to avoid huge memory usage
    with TRAIN_JSONL_PATH.open("w", encoding="utf-8") as f_out:

        for user_id, group in tqdm(user_groups, desc="Processing users"):
            movie_seq = group["movieId"].tolist()

            # Need some minimum history length
            if len(movie_seq) < MIN_HISTORY_LEN:
                continue

            # For taste vs sequence split:
            # - Use up to last MAX_SEQ_LEN + 1 as "recent"
            # - Everything before that is "taste"
            if len(movie_seq) > (MAX_SEQ_LEN + 1):
                taste_items = movie_seq[: -(MAX_SEQ_LEN + 1)]
                recent_items = movie_seq[-(MAX_SEQ_LEN + 1) :]
            else:
                taste_items = []
                recent_items = movie_seq

            # Build sliding window samples from recent_items
            samples = sliding_window_sequences(recent_items, MAX_SEQ_LEN)

            for s in samples:
                record = {
                    "user_id": int(user_id),
                    "sequence": s["sequence"],       # list[int]
                    "target": int(s["target"]),      # next movie
                    "taste": taste_items,            # list[int], older movies
                }
                f_out.write(json.dumps(record) + "\n")
                all_movie_ids.extend(s["sequence"])
                all_movie_ids.append(s["target"])
                all_movie_ids.extend(taste_items)

    # Build vocab
    print("Building vocab...")
    vocab = build_vocab(all_movie_ids)

    with VOCAB_PATH.open("w", encoding="utf-8") as f_vocab:
        json.dump(vocab, f_vocab)

    print(f"Saved training data to: {TRAIN_JSONL_PATH}")
    print(f"Saved vocab to: {VOCAB_PATH}")


if __name__ == "__main__":
    main()
