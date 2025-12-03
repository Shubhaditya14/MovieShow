'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Home, History, User, TrendingUp } from 'lucide-react';

export default function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/discover', label: 'Discover', icon: TrendingUp },
        { href: '/movies', label: 'Movies', icon: Film },
        { href: '/history', label: 'History', icon: History },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <Film className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text hidden sm:block">
                            MovieShow
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isActive
                                            ? 'bg-red-600 text-white'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden md:block">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
