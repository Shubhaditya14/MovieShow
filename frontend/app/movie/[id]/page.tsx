'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Star, Calendar, Clock, Heart, Share2, Play } from 'lucide-react';

interface MovieDetails {
    movie_id: string;
    title: string;
    clean_title: string;
    year: number;
    poster_url?: string;
    backdrop_url?: string;
    overview?: string;
    rating?: number;
    release_date?: string;
    genres?: string[];
}

export default function MovieDetailsPage() {
    const params = useParams();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingMessage, setRatingMessage] = useState<string>('');

    useEffect(() => {
        async function fetchMovie() {
            try {
                const res = await fetch(`http://localhost:8000/movies/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMovie(data);
                }
            } catch (error) {
                console.error('Failed to fetch movie details:', error);
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchMovie();
        }
    }, [params.id]);

    const handleRatingClick = async (rating: number) => {
        setUserRating(rating);
        setIsSubmittingRating(true);
        setRatingMessage('');

        try {
            // Submit rating to backend
            const response = await fetch('http://localhost:8000/interactions/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie_id: parseInt(params.id as string),
                    rating: rating * 2, // Convert 1-5 stars to 2-10 scale
                }),
            });

            if (response.ok) {
                setRatingMessage(`Rated ${rating} star${rating !== 1 ? 's' : ''}!`);
                setTimeout(() => setRatingMessage(''), 3000);
            } else {
                setRatingMessage('Failed to submit rating');
                setTimeout(() => setRatingMessage(''), 3000);
            }
        } catch (error) {
            console.error('Failed to submit rating:', error);
            setRatingMessage('Error submitting rating');
            setTimeout(() => setRatingMessage(''), 3000);
        } finally {
            setIsSubmittingRating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#14181c] text-white">
                <Navigation />
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00c030]"></div>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#14181c] text-white">
                <Navigation />
                <div className="flex items-center justify-center h-[80vh]">
                    <h1 className="text-2xl font-bold text-gray-400">Movie not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#14181c] text-white">
            <Navigation />

            {/* Backdrop */}
            <div className="relative h-[50vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
                {movie.backdrop_url ? (
                    <img
                        src={movie.backdrop_url}
                        alt={movie.title}
                        className="w-full h-full object-cover opacity-50"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                )}
            </div>

            <div className="container mx-auto px-6 -mt-32 relative z-20 pb-20">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Poster */}
                    <div className="shrink-0 w-full md:w-auto">
                        <div className="w-full md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-gray-800 bg-[#1c2228]">
                            {movie.poster_url ? (
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                    No Poster
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 pt-4 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif tracking-tight">
                            {movie.clean_title}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 mb-6 text-sm">
                            {movie.year && <span>{movie.year}</span>}
                            <span>•</span>
                            <span>{movie.genres?.join(', ') || 'Drama'}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>2h 15m</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                            <div className="flex items-center gap-1 bg-[#1c2228] px-4 py-2 rounded-md border border-gray-700">
                                <span className="text-sm text-gray-400 uppercase tracking-wider font-bold mr-2">Rate</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => handleRatingClick(star)}
                                        disabled={isSubmittingRating}
                                        className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${star <= (hoverRating || userRating)
                                                ? 'fill-[#00c030] text-[#00c030]'
                                                : 'text-gray-600'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {ratingMessage && (
                                <div className="text-sm text-[#00c030] font-medium animate-pulse">
                                    {ratingMessage}
                                </div>
                            )}

                            <button className="flex items-center gap-2 bg-[#00c030] hover:bg-[#00e054] text-black px-6 py-2 rounded-md font-bold transition-colors">
                                <Play className="w-4 h-4 fill-current" />
                                Watch
                            </button>

                            <button className="p-2 bg-[#1c2228] border border-gray-700 rounded-md hover:bg-gray-700 transition-colors text-[#ff4040]">
                                <Heart className="w-5 h-5" />
                            </button>

                            <button className="p-2 bg-[#1c2228] border border-gray-700 rounded-md hover:bg-gray-700 transition-colors text-gray-400">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Overview */}
                        <div className="max-w-3xl">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Overview</h3>
                            <p className="text-gray-300 leading-relaxed text-lg font-serif">
                                {movie.overview || "No overview available for this movie."}
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t border-gray-800 pt-8">
                            <div>
                                <h4 className="text-xs text-gray-500 uppercase font-bold mb-1">Rating</h4>
                                <div className="text-xl font-bold text-white flex items-center gap-1">
                                    <Star className="w-4 h-4 text-[#00c030] fill-current" />
                                    {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs text-gray-500 uppercase font-bold mb-1">Release Date</h4>
                                <div className="text-lg text-gray-300">{movie.release_date || 'Unknown'}</div>
                            </div>
                            <div>
                                <h4 className="text-xs text-gray-500 uppercase font-bold mb-1">Director</h4>
                                <div className="text-lg text-gray-300">Christopher Nolan</div>
                            </div>
                            <div>
                                <h4 className="text-xs text-gray-500 uppercase font-bold mb-1">Cast</h4>
                                <div className="text-lg text-gray-300">Christian Bale, ...</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
