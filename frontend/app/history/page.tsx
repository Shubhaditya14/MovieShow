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
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {sortedHistory.map((movie) => (
                            <MovieCard
                                key={`${movie.movie_id}-${movie.watchedAt}`}
                                id={movie.movie_id}
                                title={movie.title}
                                posterUrl={movie.poster_url}
                                rating={movie.rating}
                                year={movie.year?.toString()}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#1c2228] flex items-center justify-center">
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

// Mock data generator with real-ish data for demo
function generateMockHistory(): WatchedMovie[] {
    const movies = [
        { title: 'The Shawshank Redemption', id: '318', year: 1994, poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
        { title: 'The Godfather', id: '858', year: 1972, poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
        { title: 'The Dark Knight', id: '58559', year: 2008, poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
        { title: 'Pulp Fiction', id: '296', year: 1994, poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
        { title: 'Forrest Gump', id: '356', year: 1994, poster: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg' },
        { title: 'Inception', id: '27205', year: 2010, poster: 'https://image.tmdb.org/t/p/w500/9gk7admal4ZLvd9Xw1Yy8g0w9TR.jpg' },
        { title: 'Fight Club', id: '550', year: 1999, poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
        { title: 'The Matrix', id: '2571', year: 1999, poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
        { title: 'Goodfellas', id: '769', year: 1990, poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
        { title: 'The Silence of the Lambs', id: '593', year: 1991, poster: 'https://image.tmdb.org/t/p/w500/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg' },
        { title: 'Interstellar', id: '157336', year: 2014, poster: 'https://image.tmdb.org/t/p/w500/gEU2QniL6C8zt75SS96RoSyJp8.jpg' },
        { title: 'Parasite', id: '496243', year: 2019, poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' }
    ];

    return Array.from({ length: 20 }, (_, i) => {
        const movie = movies[i % movies.length];
        const daysAgo = Math.floor(Math.random() * 60);
        const watchedAt = new Date();
        watchedAt.setDate(watchedAt.getDate() - daysAgo);

        return {
            movie_id: movie.id,
            title: movie.title,
            genres: ['Drama'],
            year: movie.year,
            rating: 7 + Math.random() * 3,
            poster_url: movie.poster,
            watchedAt: watchedAt.toISOString(),
            watchCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 1,
        };
    });
}
