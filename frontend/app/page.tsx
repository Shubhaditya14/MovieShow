'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import MovieCard from '@/components/MovieCard';
import { Play, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';

export default function Home() {
    const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
    const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading movies (replace with actual API calls later)
        setTimeout(() => {
            setFeaturedMovies(generateMockMovies(6));
            setTrendingMovies(generateMockMovies(12));
            setLoading(false);
        }, 1000);
    }, []);

    const handleWatch = (movieId: string) => {
        console.log('Watch movie:', movieId);
        // TODO: Implement watch functionality
    };

    const handleLike = (movieId: string) => {
        console.log('Like movie:', movieId);
        // TODO: Implement like functionality
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            {/* Hero Section */}
            <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-background to-background" />

                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto fade-in">
                    <div className="inline-flex items-center space-x-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-300 font-medium">AI-Powered Recommendations</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        Discover Your Next
                        <br />
                        <span className="gradient-text">Favorite Movie</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        Experience personalized movie recommendations powered by advanced machine learning.
                        Find hidden gems tailored just for you.
                    </p>

                    <div className="flex items-center justify-center space-x-4">
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 transform hover:scale-105 transition-all">
                            <Play className="w-5 h-5 fill-current" />
                            <span>Get Started</span>
                        </button>

                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 border border-white/20 transform hover:scale-105 transition-all">
                            <TrendingUp className="w-5 h-5" />
                            <span>Explore Trending</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                {/* Featured Section */}
                <section className="fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Featured for You</h2>
                            <p className="text-gray-400">Personalized picks based on your taste</p>
                        </div>
                        <button className="text-red-500 hover:text-red-400 flex items-center space-x-1 font-medium">
                            <span>View All</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg shimmer" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {featuredMovies.map((movie) => (
                                <MovieCard
                                    key={movie.movie_id}
                                    movie={movie}
                                    onWatch={handleWatch}
                                    onLike={handleLike}
                                    showScore
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Trending Section */}
                <section className="fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Trending Now</h2>
                            <p className="text-gray-400">What everyone's watching</p>
                        </div>
                        <button className="text-red-500 hover:text-red-400 flex items-center space-x-1 font-medium">
                            <span>View All</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg shimmer" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {trendingMovies.map((movie) => (
                                <MovieCard
                                    key={movie.movie_id}
                                    movie={movie}
                                    onWatch={handleWatch}
                                    onLike={handleLike}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

// Mock data generator (replace with actual API calls)
function generateMockMovies(count: number) {
    const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance'];
    const titles = [
        'The Shawshank Redemption',
        'The Godfather',
        'The Dark Knight',
        'Pulp Fiction',
        'Forrest Gump',
        'Inception',
        'Fight Club',
        'The Matrix',
        'Goodfellas',
        'The Silence of the Lambs',
        'Interstellar',
        'Parasite',
    ];

    return Array.from({ length: count }, (_, i) => ({
        movie_id: `${i + 1}`,
        title: titles[i % titles.length],
        genres: [genres[Math.floor(Math.random() * genres.length)], genres[Math.floor(Math.random() * genres.length)]],
        year: 1990 + Math.floor(Math.random() * 34),
        score: 7 + Math.random() * 3,
        rating: 7 + Math.random() * 3,
        poster_url: `https://via.placeholder.com/300x450/1f1f1f/ffffff?text=${encodeURIComponent(titles[i % titles.length])}`,
    }));
}
