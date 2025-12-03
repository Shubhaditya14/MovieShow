'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import MovieCard from '@/components/MovieCard';
import { Clock, Calendar, Trash2 } from 'lucide-react';

interface WatchedMovie {
    movie_id: string;
    title: string;
    genres?: string[];
    year?: number;
    rating?: number;
    poster_url?: string;
    watchedAt: string;
    watchCount: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<WatchedMovie[]>([]);
    const [sortBy, setSortBy] = useState<'recent' | 'title' | 'rating'>('recent');

    useEffect(() => {
        setHistory(generateMockHistory());
    }, []);

    const sortedHistory = [...history].sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime();
            case 'title':
                return a.title.localeCompare(b.title);
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear your entire watch history?')) {
            setHistory([]);
        }
    };

    const removeMovie = (movieId: string) => {
        setHistory(prev => prev.filter(m => m.movie_id !== movieId));
    };

    const totalWatchTime = history.reduce((acc, movie) => acc + (movie.watchCount * 120), 0);
    const uniqueMovies = new Set(history.map(m => m.movie_id)).size;

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Watch History</h1>
                    <p className="text-gray-400">Track all the movies you've watched</p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="glass rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Watch Time</p>
                                <p className="text-2xl font-bold text-white">{Math.floor(totalWatchTime / 60)}h {totalWatchTime % 60}m</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Movies Watched</p>
                                <p className="text-2xl font-bold text-white">{uniqueMovies}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">This Month</p>
                                <p className="text-2xl font-bold text-white">{Math.floor(uniqueMovies / 3)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <label className="text-gray-400 text-sm">Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="recent">Recently Watched</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>

                    <button
                        onClick={clearHistory}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear History</span>
                    </button>
                </div>

                {/* History Grid */}
                {sortedHistory.length > 0 ? (
                    <div className="space-y-4">
                        {sortedHistory.map((movie) => (
                            <div
                                key={`${movie.movie_id}-${movie.watchedAt}`}
                                className="glass rounded-lg p-4 flex items-center space-x-4 hover:bg-white/10 transition-all group"
                            >
                                {/* Poster */}
                                <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                                    <img
                                        src={movie.poster_url || '/placeholder.jpg'}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://via.placeholder.com/80x112/1f1f1f/ffffff?text=${encodeURIComponent(movie.title.slice(0, 1))}`;
                                        }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-lg mb-1">{movie.title}</h3>

                                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                                        {movie.year && <span>{movie.year}</span>}
                                        {movie.genres && movie.genres.length > 0 && (
                                            <span>{movie.genres.join(', ')}</span>
                                        )}
                                        {movie.rating && (
                                            <span className="text-yellow-400">★ {movie.rating.toFixed(1)}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>Watched {new Date(movie.watchedAt).toLocaleDateString()}</span>
                                        {movie.watchCount > 1 && (
                                            <span className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded">
                                                Watched {movie.watchCount}x
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => removeMovie(movie.movie_id)}
                                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                            <Clock className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No watch history yet</h3>
                        <p className="text-gray-400">Start watching movies to build your history</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Mock data generator
function generateMockHistory(): WatchedMovie[] {
    const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller'];
    const titles = [
        'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Pulp Fiction',
        'Forrest Gump', 'Inception', 'Fight Club', 'The Matrix', 'Goodfellas',
        'The Silence of the Lambs', 'Interstellar', 'Parasite'
    ];

    return Array.from({ length: 20 }, (_, i) => {
        const daysAgo = Math.floor(Math.random() * 60);
        const watchedAt = new Date();
        watchedAt.setDate(watchedAt.getDate() - daysAgo);

        return {
            movie_id: `${i + 1}`,
            title: titles[i % titles.length],
            genres: [genres[Math.floor(Math.random() * genres.length)]],
            year: 1990 + Math.floor(Math.random() * 35),
            rating: 7 + Math.random() * 3,
            poster_url: `https://via.placeholder.com/80x112/1f1f1f/ffffff?text=${encodeURIComponent(titles[i % titles.length])}`,
            watchedAt: watchedAt.toISOString(),
            watchCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 1,
        };
    });
}
