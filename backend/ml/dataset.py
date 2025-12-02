# backend/ml/dataset.py

import json
from pathlib import Path
from torch.utils.data import Dataset
import torch


class MovieLensDataset(Dataset):
    def __init__(self, jsonl_path: str, vocab_path: str, max_seq_len: int = 50):
        self.max_seq_len = max_seq_len

        # Load vocab
        vocab = json.loads(Path(vocab_path).read_text())
        self.movie_to_idx = vocab["movie_id_to_index"]
        self.pad_idx = vocab["pad_index"]

        # Load JSONL lines (lazy enough for 20M)
        with open(jsonl_path, "r") as f:
            self.samples = [json.loads(line) for line in f]

    def __len__(self):
        return len(self.samples)

    def _pad_left(self, seq_ids):
        """Pad sequence on the LEFT to max_seq_len."""
        if len(seq_ids) >= self.max_seq_len:
            seq_ids = seq_ids[-self.max_seq_len:]

        padding = [self.pad_idx] * (self.max_seq_len - len(seq_ids))
        return padding + seq_ids

    def _to_idx(self, movie_ids):
        """Map movie IDs → vocab indices (ignore IDs not found)."""
        return [self.movie_to_idx[str(mid)] for mid in movie_ids if str(mid) in self.movie_to_idx]

    def __getitem__(self, idx):
        sample = self.samples[idx]

        # Convert IDs → indices
        seq = self._to_idx(sample["sequence"])
        target = self.movie_to_idx[str(sample["target"])]
        taste = self._to_idx(sample["taste"])

        # Left-pad sequence
        seq_padded = self._pad_left(seq)

        # Attention mask: 1 for real tokens, 0 for padding
        attn_mask = [1 if token != self.pad_idx else 0 for token in seq_padded]

        return {
            "sequence": torch.tensor(seq_padded, dtype=torch.long),
            "attention_mask": torch.tensor(attn_mask, dtype=torch.long),
            "taste": torch.tensor(taste, dtype=torch.long),  # variable length
            "target": torch.tensor(target, dtype=torch.long)
        }
