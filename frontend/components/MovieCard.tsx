import Link from 'next/link';
import { Star } from 'lucide-react';

interface MovieCardProps {
    id: string;
    title: string;
    posterUrl?: string;
    rating?: number;
    year?: string;
}

export default function MovieCard({ id, title, posterUrl, rating, year }: MovieCardProps) {
    // Generate a consistent gradient based on the title string for fallbacks
    const getGradient = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c1 = Math.abs(hash % 360);
        const c2 = (c1 + 40) % 360;
        return `linear-gradient(135deg, hsl(${c1}, 70%, 20%), hsl(${c2}, 70%, 20%))`;
    };

    return (
        <Link href={`/movie/${id}`} className="block group">
            <div className="poster-container relative w-full bg-[#1c2228] rounded overflow-hidden shadow-lg group-hover:ring-2 ring-[#ff8000] transition-all duration-200">
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}

                {/* Fallback if no poster or error */}
                <div
                    className={`absolute inset-0 flex items-center justify-center p-4 text-center ${posterUrl ? 'hidden' : ''}`}
                    style={{ background: getGradient(title) }}
                >
                    <span className="text-sm font-medium text-gray-300 line-clamp-3">
                        {title}
                    </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[2px]">
                    <h3 className="font-bold text-white text-sm mb-2 line-clamp-3">{title}</h3>
                    {year && <span className="text-xs text-gray-300 mb-2">{year}</span>}
                    {rating && (
                        <div className="flex items-center gap-1 text-[#ff8000]">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-bold">{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
