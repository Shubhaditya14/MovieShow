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

// Mock data generator with real posters
function generateMockMovies(count: number) {
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
        { title: 'Parasite', id: '496243', year: 2019, poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
        { title: 'Gladiator', id: '98', year: 2000, poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg' },
        { title: 'The Departed', id: '1422', year: 2006, poster: 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg6qT.jpg' },
        { title: 'Whiplash', id: '244786', year: 2014, poster: 'https://image.tmdb.org/t/p/w500/7fn624j5g3iRYBxXn7RPyG24DQU.jpg' },
        { title: 'The Prestige', id: '1124', year: 2006, poster: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8oa0j.jpg' },
        { title: 'Memento', id: '77', year: 2000, poster: 'https://image.tmdb.org/t/p/w500/yuNs09hvpHBY45slPW237RHXVf.jpg' },
        { title: 'The Lion King', id: '8587', year: 1994, poster: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsdP5.jpg' },
        { title: 'Saving Private Ryan', id: '857', year: 1998, poster: 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg' },
        { title: 'The Green Mile', id: '497', year: 1999, poster: 'https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg' },
        { title: 'The Usual Suspects', id: '629', year: 1995, poster: 'https://image.tmdb.org/t/p/w500/bUP53TEVewE1zzMYG48CD4P17M1.jpg' },
        { title: 'Se7en', id: '807', year: 1995, poster: 'https://image.tmdb.org/t/p/w500/69Sns8WoET6CfaYlIkHZPXSbFMv.jpg' },
        { title: 'City of God', id: '598', year: 2002, poster: 'https://image.tmdb.org/t/p/w500/k7eYdWqYQyPqrKDIsp8k6dZGdei.jpg' },
        { title: 'Spirited Away', id: '129', year: 2001, poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' }
    ];

    const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance'];

    return Array.from({ length: count }, (_, i) => {
        const movie = movies[i % movies.length];
        return {
            movie_id: movie.id,
            title: movie.title,
            genres: [genres[Math.floor(Math.random() * genres.length)], genres[Math.floor(Math.random() * genres.length)]],
            year: movie.year,
            rating: 7 + Math.random() * 3,
            poster_url: movie.poster,
        };
    });
}
