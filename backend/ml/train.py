# backend/ml/train.py

import json
from pathlib import Path
import random
from typing import Dict, List

import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader

from backend.ml.dataset import MovieLensDataset
from backend.ml.model import TransformerRecModel


# -----------------------------
# Config
# -----------------------------
MAX_SEQ_LEN = 50
BATCH_SIZE = 256
NUM_EPOCHS = 3
NUM_NEGATIVES = 20      # negatives per positive
LR = 1e-3

DATA_DIR = Path("data")
TRAIN_JSONL_PATH = DATA_DIR / "movielens_processed" / "train.jsonl"
VOCAB_PATH = DATA_DIR / "vocab.json"
CHECKPOINT_DIR = Path("model_checkpoints")
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)


# -----------------------------
# Collate function factory
# -----------------------------
def make_collate_fn(pad_idx: int, num_items: int, num_negatives: int):
    """
    Returns a collate_fn that:
    - stacks sequences and masks
    - pads taste lists
    - builds candidate_items with 1 positive + sampled negatives
    """

    def collate_fn(batch: List[Dict]):
        # sequences and masks
        sequences = torch.stack([b["sequence"] for b in batch], dim=0)        # [B, L]
        attention_masks = torch.stack([b["attention_mask"] for b in batch], dim=0)  # [B, L]

        # targets: [B]
        targets = torch.stack([b["target"] for b in batch], dim=0)            # [B]

        # taste: variable lengths → pad
        tastes = [b["taste"] for b in batch]
        max_taste_len = max((t.size(0) for t in tastes), default=1)
        padded_tastes = []
        for t in tastes:
            if t.size(0) < max_taste_len:
                pad = torch.full((max_taste_len - t.size(0),), pad_idx, dtype=torch.long)
                padded_tastes.append(torch.cat([t, pad], dim=0))
            else:
                padded_tastes.append(t)
        taste_tensor = torch.stack(padded_tastes, dim=0)   # [B, T]

        # candidate_items: first column = positive target, rest = negatives
        B = targets.size(0)
        K = num_negatives + 1

        # sample negatives uniformly from [1, num_items-1]
        negs = torch.randint(
            low=1,
            high=num_items,
            size=(B, num_negatives),
            dtype=torch.long,
        )

        # ensure negatives ≠ target (simple resample where equal)
        for i in range(B):
            for j in range(num_negatives):
                if negs[i, j].item() == targets[i].item():
                    # resample
                    new_val = random.randint(1, num_items - 1)
                    while new_val == targets[i].item():
                        new_val = random.randint(1, num_items - 1)
                    negs[i, j] = new_val

        # concat: [B, 1 + num_negatives]
        candidate_items = torch.cat(
            [targets.unsqueeze(1), negs],
            dim=1
        )

        batch_out = {
            "sequence": sequences,
            "attention_mask": attention_masks,
            "taste": taste_tensor,
            "target": targets,
            "candidate_items": candidate_items,
        }
        return batch_out

    return collate_fn


# -----------------------------
# Training loop
# -----------------------------
def train():
    # Device
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")
    print(f"Using device: {device}")

    # Load vocab
    vocab = json.loads(VOCAB_PATH.read_text())
    movie_to_idx = vocab["movie_id_to_index"]
    pad_idx = vocab["pad_index"]
    num_items = max(movie_to_idx.values()) + 1  # since we started at 1

    # Dataset + DataLoader
    dataset = MovieLensDataset(
        jsonl_path=str(TRAIN_JSONL_PATH),
        vocab_path=str(VOCAB_PATH),
        max_seq_len=MAX_SEQ_LEN,
    )

    collate_fn = make_collate_fn(
        pad_idx=pad_idx,
        num_items=num_items,
        num_negatives=NUM_NEGATIVES,
    )

    dataloader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        collate_fn=collate_fn,
        num_workers=0,    # bump later if needed
    )

    # Model
    model = TransformerRecModel(
        num_items=num_items,
        d_model=128,
        n_heads=4,
        n_layers=2,
        max_seq_len=MAX_SEQ_LEN,
        pad_idx=pad_idx,
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    global_step = 0

    model.train()
    for epoch in range(1, NUM_EPOCHS + 1):
        total_loss = 0.0
        for batch in dataloader:
            sequence = batch["sequence"].to(device)          # [B, L]
            attention_mask = batch["attention_mask"].to(device)  # [B, L]
            taste = batch["taste"].to(device)                # [B, T]
            candidate_items = batch["candidate_items"].to(device)  # [B, K]

            # Forward: scores for each candidate
            scores = model(
                sequence=sequence,
                attention_mask=attention_mask,
                taste=taste,
                candidate_items=candidate_items,
            )  # [B, K]

            # Labels: index 0 is always the positive (true) item
            labels = torch.zeros(scores.size(0), dtype=torch.long, device=device)

            loss = F.cross_entropy(scores, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            global_step += 1

            if global_step % 100 == 0:
                avg_loss = total_loss / global_step
                print(f"Epoch {epoch} | Step {global_step} | Loss: {loss.item():.4f} | Avg: {avg_loss:.4f}")

        # Save checkpoint after each epoch
        ckpt_path = CHECKPOINT_DIR / f"transformer_epoch{epoch}.pt"
        torch.save(
            {
                "model_state_dict": model.state_dict(),
                "vocab": vocab,
                "config": {
                    "d_model": 128,
                    "n_heads": 4,
                    "n_layers": 2,
                    "max_seq_len": MAX_SEQ_LEN,
                    "pad_idx": pad_idx,
                    "num_items": num_items,
                },
            },
            ckpt_path
        )
        print(f"Saved checkpoint: {ckpt_path}")


if __name__ == "__main__":
    train()
