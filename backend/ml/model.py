# backend/ml/model.py

import torch
import torch.nn as nn
import torch.nn.functional as F


class TransformerRecModel(nn.Module):
    def __init__(
        self,
        num_items: int,
        d_model: int = 128,
        n_heads: int = 4,
        n_layers: int = 2,
        max_seq_len: int = 50,
        pad_idx: int = 0,
        dropout: float = 0.1,
    ):
        """
        num_items: size of item vocabulary (max index + 1)
        d_model: embedding dimension
        n_heads: attention heads
        n_layers: number of Transformer encoder layers
        max_seq_len: sequence length (we use 50)
        pad_idx: index used for padding tokens
        """

        super().__init__()
        self.num_items = num_items
        self.d_model = d_model
        self.max_seq_len = max_seq_len
        self.pad_idx = pad_idx

        # Item embedding table (shared for sequence, taste, and candidates)
        self.item_embedding = nn.Embedding(
            num_embeddings=num_items,
            embedding_dim=d_model,
            padding_idx=pad_idx,
        )

        # Positional embeddings (for positions 0..max_seq_len-1)
        self.position_embedding = nn.Embedding(
            num_embeddings=max_seq_len,
            embedding_dim=d_model,
        )

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=4 * d_model,
            dropout=dropout,
            batch_first=True,  # [B, L, D] instead of [L, B, D]
        )
        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=n_layers,
        )

        # Optional projection after combining sequence + taste
        self.user_proj = nn.Linear(d_model, d_model)

        # We will use dot product scoring:
        # score(user, item) = <user_emb, item_emb>
        # So no extra output head is strictly required.

    def forward(
        self,
        sequence: torch.Tensor,        # [B, L] item indices (left-padded)
        attention_mask: torch.Tensor,  # [B, L] 1 for real, 0 for pad
        taste: torch.Tensor,           # [B, T] item indices (padded with pad_idx)
        candidate_items: torch.Tensor, # [B, K] candidate movie indices
    ):
        """
        Forward pass.

        sequence: LongTensor [B, L]
        attention_mask: LongTensor [B, L]  (1 = real token, 0 = padding)
        taste: LongTensor [B, T]
        candidate_items: LongTensor [B, K]

        Returns:
            scores: FloatTensor [B, K] (higher = more relevant)
        """

        device = sequence.device
        B, L = sequence.shape

        # ---- 1. Embed sequence ----
        seq_emb = self.item_embedding(sequence)  # [B, L, D]

        # Positional indices: 0..L-1 (we assume the rightmost is last position)
        pos_ids = torch.arange(L, device=device).unsqueeze(0).expand(B, L)
        pos_emb = self.position_embedding(pos_ids)  # [B, L, D]

        # Add positional info
        seq_emb = seq_emb + pos_emb

        # ---- 2. Build Transformer padding mask ----
        # src_key_padding_mask: [B, L] with True for PAD positions
        src_key_padding_mask = (sequence == self.pad_idx)  # bool

        # ---- 3. Transformer encoder ----
        # batch_first=True, so input is [B, L, D]
        seq_out = self.transformer(
            seq_emb,
            src_key_padding_mask=src_key_padding_mask
        )  # [B, L, D]

        # ---- 4. Get short-term user embedding (last non-pad position) ----
        # Because we left-padded, the last position is always the most recent item
        seq_user_emb = seq_out[:, -1, :]  # [B, D]

        # ---- 5. Taste embedding (long-term) ----
        # taste: [B, T], padded with pad_idx
        taste_emb = self.item_embedding(taste)  # [B, T, D]

        # mask out pad positions in taste
        taste_mask = (taste != self.pad_idx).float().unsqueeze(-1)  # [B, T, 1]
        masked_taste_emb = taste_emb * taste_mask  # zero out pad rows

        # sum over T, then divide by count of non-pad tokens
        taste_sum = masked_taste_emb.sum(dim=1)  # [B, D]
        taste_count = taste_mask.sum(dim=1).clamp(min=1.0)  # [B, 1]
        taste_user_emb = taste_sum / taste_count  # [B, D]

        # ---- 6. Fuse sequence + taste ----
        user_emb = seq_user_emb + taste_user_emb  # [B, D]
        user_emb = self.user_proj(user_emb)       # [B, D]

        # ---- 7. Candidate item embeddings ----
        # candidate_items: [B, K]
        cand_emb = self.item_embedding(candidate_items)  # [B, K, D]

        # ---- 8. Dot product scoring ----
        # scores[b, k] = dot(user_emb[b], cand_emb[b, k])
        # We can do: (B, K, D) · (B, D, 1) -> (B, K, 1) -> (B, K)
        user_emb_expanded = user_emb.unsqueeze(-1)     # [B, D, 1]
        scores = torch.bmm(cand_emb, user_emb_expanded).squeeze(-1)  # [B, K]

        return scores
