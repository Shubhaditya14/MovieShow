'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import MovieCard from '@/components/MovieCard';
import { Grid, List, SlidersHorizontal } from 'lucide-react';

export default function MoviesPage() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setMovies(generateMockMovies(48));
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">All Movies</h1>
                        <p className="text-gray-400">Browse our complete collection</p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Movies Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg shimmer" />
                        ))}
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                        : 'space-y-4'
                    }>
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.movie_id}
                                movie={movie}
                                onWatch={(id) => console.log('Watch:', id)}
                                onLike={(id) => console.log('Like:', id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function generateMockMovies(count: number) {
    const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance'];
    const titles = [
        'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Pulp Fiction',
        'Forrest Gump', 'Inception', 'Fight Club', 'The Matrix', 'Goodfellas',
        'The Silence of the Lambs', 'Interstellar', 'Parasite', 'Gladiator',
        'The Departed', 'Whiplash', 'The Prestige', 'Memento', 'The Lion King',
    ];

    return Array.from({ length: count }, (_, i) => ({
        movie_id: `${i + 1}`,
        title: titles[i % titles.length],
        genres: [genres[Math.floor(Math.random() * genres.length)]],
        year: 1990 + Math.floor(Math.random() * 35),
        rating: 7 + Math.random() * 3,
        poster_url: `https://via.placeholder.com/300x450/1f1f1f/ffffff?text=${encodeURIComponent(titles[i % titles.length])}`,
    }));
}
