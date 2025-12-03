'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import MovieCard from '@/components/MovieCard';
import { Search, Filter, X } from 'lucide-react';

const GENRES = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance',
    'Sci-Fi', 'Thriller', 'War', 'Western'
];

const YEARS = Array.from({ length: 34 }, (_, i) => 2024 - i);

export default function DiscoverPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [movies, setMovies] = useState<any[]>(generateMockMovies(24));

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSelectedYear(null);
        setSearchQuery('');
    };

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = selectedGenres.length === 0 ||
            selectedGenres.some(g => movie.genres.includes(g));
        const matchesYear = !selectedYear || movie.year === selectedYear;

        return matchesSearch && matchesGenre && matchesYear;
    });

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Discover Movies</h1>
                    <p className="text-gray-400">Find your next favorite from thousands of titles</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-8 space-y-4">
                    <div className="flex items-center space-x-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${showFilters || selectedGenres.length > 0 || selectedYear
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                            {(selectedGenres.length > 0 || selectedYear) && (
                                <span className="bg-white text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                    {selectedGenres.length + (selectedYear ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {/* Clear Filters */}
                        {(selectedGenres.length > 0 || selectedYear || searchQuery) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="glass rounded-lg p-6 space-y-6 fade-in">
                            {/* Genre Filter */}
                            <div>
                                <h3 className="text-white font-semibold mb-3">Genres</h3>
                                <div className="flex flex-wrap gap-2">
                                    {GENRES.map(genre => (
                                        <button
                                            key={genre}
                                            onClick={() => toggleGenre(genre)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenres.includes(genre)
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                }`}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Year Filter */}
                            <div>
                                <h3 className="text-white font-semibold mb-3">Release Year</h3>
                                <select
                                    value={selectedYear || ''}
                                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="">All Years</option>
                                    {YEARS.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="mb-4">
                    <p className="text-gray-400">
                        Showing <span className="text-white font-semibold">{filteredMovies.length}</span> movies
                    </p>
                </div>

                {/* Movies Grid */}
                {filteredMovies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredMovies.map(movie => (
                            <MovieCard
                                key={movie.movie_id}
                                movie={movie}
                                onWatch={(id) => console.log('Watch:', id)}
                                onLike={(id) => console.log('Like:', id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                            <Search className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
                        <p className="text-gray-400">Try adjusting your filters or search query</p>
                    </div>
                )}
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
        'The Silence of the Lambs', 'Interstellar', 'Parasite', 'Gladiator',
        'The Departed', 'Whiplash', 'The Prestige', 'Memento', 'The Lion King',
        'Saving Private Ryan', 'The Green Mile', 'The Usual Suspects', 'Se7en',
        'City of God', 'Spirited Away'
    ];

    return Array.from({ length: count }, (_, i) => ({
        movie_id: `${i + 1}`,
        title: titles[i % titles.length],
        genres: [genres[Math.floor(Math.random() * genres.length)], genres[Math.floor(Math.random() * genres.length)]],
        year: 1990 + Math.floor(Math.random() * 35),
        rating: 7 + Math.random() * 3,
        poster_url: `https://via.placeholder.com/300x450/1f1f1f/ffffff?text=${encodeURIComponent(titles[i % titles.length])}`,
    }));
}
