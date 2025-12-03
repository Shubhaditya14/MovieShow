'use client';

import { useState } from 'react';
import { Star, Play, Info, Heart } from 'lucide-react';
import Image from 'next/image';

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

    const posterUrl = movie.poster_url || '/placeholder-movie.jpg';

    return (
        <div
            className="group relative rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Movie Poster */}
            <div className="relative aspect-[2/3] bg-gray-800">
                {!imageError ? (
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-red-600/20 flex items-center justify-center">
                                <Play className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-300">{movie.title}</p>
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
