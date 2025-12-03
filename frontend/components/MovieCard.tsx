'use client';

import { useState } from 'react';
import { Star, Play, Info, Heart } from 'lucide-react';

interface MovieCardProps {
    movie: {
        movie_id: string;
        title: string;
        poster_url?: string;
        genres?: string[];
        year?: number;
        score?: number;
        rating?: number;
    };
    onWatch?: (movieId: string) => void;
    onLike?: (movieId: string) => void;
    showScore?: boolean;
}

export default function MovieCard({ movie, onWatch, onLike, showScore = false }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Generate a color based on movie title for consistent fallback colors
    const getColorFromTitle = (title: string) => {
        const colors = [
            'from-red-600 to-red-800',
            'from-blue-600 to-blue-800',
            'from-purple-600 to-purple-800',
            'from-green-600 to-green-800',
            'from-yellow-600 to-yellow-800',
            'from-pink-600 to-pink-800',
        ];
        const index = title.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const posterUrl = movie.poster_url || '/placeholder-movie.jpg';

    return (
        <div
            className="group relative rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Movie Poster */}
            <div className="relative aspect-[2/3] bg-gray-800">
                {!imageError && movie.poster_url ? (
                    <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getColorFromTitle(movie.title)}`}>
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                            <p className="text-sm font-bold text-white px-2 line-clamp-3">{movie.title}</p>
                            {movie.year && (
                                <p className="text-xs text-white/80 mt-2">{movie.year}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Score Badge */}
                {showScore && movie.score !== undefined && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                        {movie.score.toFixed(1)}
                    </div>
                )}

                {/* Rating Badge */}
                {movie.rating && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-md text-xs font-bold flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{movie.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Hover Content */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
            >
                <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{movie.title}</h3>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {movie.genres.slice(0, 3).map((genre) => (
                            <span
                                key={genre}
                                className="text-xs px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-gray-200"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                )}

                {/* Year */}
                {movie.year && (
                    <p className="text-gray-400 text-sm mb-3">{movie.year}</p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    {onWatch && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onWatch(movie.movie_id);
                            }}
                            className="flex-1 bg-white text-black px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Watch</span>
                        </button>
                    )}

                    {onLike && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLike(movie.movie_id);
                            }}
                            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-md hover:bg-white/30 transition-colors"
                        >
                            <Heart className="w-4 h-4" />
                        </button>
                    )}

                    <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-md hover:bg-white/30 transition-colors">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
