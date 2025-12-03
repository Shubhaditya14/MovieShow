#!/usr/bin/env python3
"""
Test script for the recommendation engine
"""
import time
import json
from pathlib import Path
from ml.inference import load_model, recommend

def load_movie_titles():
    """Load movie titles for display"""
    import pandas as pd
    movies_path = Path(__file__).parent.parent / "data" / "movielens_raw" / "movies.csv"
    df = pd.read_csv(movies_path)
    # Ensure movie IDs are strings to match vocab format
    return {str(mid): title for mid, title in zip(df['movieId'], df['title'])}

def test_recommendations():
    print("=" * 80)
    print("TESTING MOVIE RECOMMENDATION ENGINE")
    print("=" * 80)
    
    # Load model
    print("\n[1/4] Loading trained model...")
    start = time.time()
    model, vocab, user_embeddings = load_model()
    load_time = time.time() - start
    print(f"✓ Model loaded in {load_time:.2f}s")
    
    # Load movie titles
    print("\n[2/4] Loading movie metadata...")
    movie_titles = load_movie_titles()
    print(f"✓ Loaded {len(movie_titles)} movie titles")
    
    # Test cases
    test_cases = [
        {
            "name": "Sci-Fi Fan",
            "history": ["1", "260", "1210"],  # Toy Story, Star Wars, Star Wars VI
            "description": "User who loves Star Wars"
        },
        {
            "name": "Drama Lover",
            "history": ["318", "858", "527"],  # Shawshank, Godfather, Schindler's
            "description": "User who loves classic dramas"
        },
        {
            "name": "Action Enthusiast",
            "history": ["2571", "4993", "5952"],  # Matrix, LOTR, LOTR Two Towers
            "description": "User who loves action/fantasy"
        }
    ]
    
    print("\n[3/4] Running test cases...")
    print("=" * 80)
    
    all_times = []
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'─' * 80}")
        print(f"TEST CASE {i}: {test['name']}")
        print(f"Description: {test['description']}")
        print(f"\nWatch History:")
        for movie_id in test['history']:
            title = movie_titles.get(movie_id, f"Movie {movie_id}")
            print(f"  • {title}")
        
        # Get recommendations
        start = time.time()
        recs = recommend(
            model=model,
            vocab=vocab,
            device=model.item_embedding.weight.device,
            user_history=test['history'],
            top_k=10
        )
        inference_time = time.time() - start
        all_times.append(inference_time)
        
        print(f"\n📊 Recommendations (generated in {inference_time*1000:.1f}ms):")
        for j, rec in enumerate(recs, 1):
            movie_id = str(rec['movie_id'])  # Convert to string for lookup
            score = rec['score']
            title = movie_titles.get(movie_id, f"Movie {movie_id}")
            print(f"  {j:2d}. {title[:60]:<60} (score: {score:.3f})")
    
    # Benchmark summary
    print("\n" + "=" * 80)
    print("[4/4] BENCHMARK RESULTS")
    print("=" * 80)
    print(f"Total test cases: {len(test_cases)}")
    print(f"Average inference time: {sum(all_times)/len(all_times)*1000:.1f}ms")
    print(f"Min inference time: {min(all_times)*1000:.1f}ms")
    print(f"Max inference time: {max(all_times)*1000:.1f}ms")
    print(f"Throughput: ~{1/sum(all_times)*len(all_times):.1f} requests/second")
    
    print("\n✓ All tests completed successfully!")
    print("=" * 80)

if __name__ == "__main__":
    test_recommendations()
