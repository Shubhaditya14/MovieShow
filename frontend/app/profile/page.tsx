'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import MovieCard from '@/components/MovieCard';
import { User, Film, Heart, TrendingUp, Calendar, Award } from 'lucide-react';

export default function ProfilePage() {
    const [watchHistory, setWatchHistory] = useState(generateMockMovies(12));
    const [favorites, setFavorites] = useState(generateMockMovies(6));

    const stats = [
        { label: 'Movies Watched', value: '247', icon: Film, color: 'text-blue-400' },
        { label: 'Favorites', value: '42', icon: Heart, color: 'text-red-400' },
        { label: 'Watch Time', value: '486h', icon: Calendar, color: 'text-green-400' },
        { label: 'Achievements', value: '15', icon: Award, color: 'text-yellow-400' },
    ];

    const genreDistribution = [
        { genre: 'Action', percentage: 35, color: 'bg-red-500' },
        { genre: 'Drama', percentage: 25, color: 'bg-blue-500' },
        { genre: 'Comedy', percentage: 20, color: 'bg-green-500' },
        { genre: 'Sci-Fi', percentage: 15, color: 'bg-purple-500' },
        { genre: 'Other', percentage: 5, color: 'bg-gray-500' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="glass rounded-2xl p-8 mb-8">
                    <div className="flex items-start space-x-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                            <User className="w-12 h-12 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">Movie Enthusiast</h1>
                            <p className="text-gray-400 mb-4">Member since January 2024</p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={stat.label} className="bg-white/5 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Icon className={`w-5 h-5 ${stat.color}`} />
                                                <span className="text-gray-400 text-sm">{stat.label}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Taste Profile */}
                <div className="glass rounded-2xl p-8 mb-8">
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-bold text-white">Your Taste Profile</h2>
                    </div>

                    <div className="space-y-4">
                        {genreDistribution.map((item) => (
                            <div key={item.genre}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium">{item.genre}</span>
                                    <span className="text-gray-400">{item.percentage}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-red-600/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-red-400">AI Insight:</span> You have a strong preference for action-packed movies with complex narratives. We recommend exploring more thriller and mystery titles!
                        </p>
                    </div>
                </div>

                {/* Watch History */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Recently Watched</h2>
                            <p className="text-gray-400">Your viewing history</p>
                        </div>
                        <button className="text-red-500 hover:text-red-400 font-medium">
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {watchHistory.map((movie) => (
                            <MovieCard
                                key={movie.movie_id}
                                movie={movie}
                                onWatch={(id) => console.log('Watch:', id)}
                                onLike={(id) => console.log('Like:', id)}
                            />
                        ))}
                    </div>
                </section>

                {/* Favorites */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Your Favorites</h2>
                            <p className="text-gray-400">Movies you loved</p>
                        </div>
                        <button className="text-red-500 hover:text-red-400 font-medium">
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {favorites.map((movie) => (
                            <MovieCard
                                key={movie.movie_id}
                                movie={movie}
                                onWatch={(id) => console.log('Watch:', id)}
                                onLike={(id) => console.log('Like:', id)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

// Mock data generator
function generateMockMovies(count: number) {
    const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance'];
    const titles = [
        'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Pulp Fiction',
        'Forrest Gump', 'Inception', 'Fight Club', 'The Matrix', 'Goodfellas',
        'The Silence of the Lambs', 'Interstellar', 'Parasite'
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
