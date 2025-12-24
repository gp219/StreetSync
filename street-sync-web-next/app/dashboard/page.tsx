'use client';
import AuthGuard from '@/app/components/AuthGuard';
import MapComponent from '@/app/components/Map';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <AuthGuard>
            <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-900">
                <header className="h-16 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-2000">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/streetsync.png" 
                            alt="StreetSync Logo"
                            width={36}
                            height={36}
                            className="object-contain"
                        />
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white">
                                STREET<span className="text-blue-500">SYNC</span>
                            </h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold leading-none">
                                Live Intelligence
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-green-400">System Live</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-red-500/10 hover:text-red-500 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 transition-all duration-200 group"
                        >
                            <span className="text-sm font-semibold">Logout</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* --- MAP AREA --- */}
                <main className="flex-1 relative">
                    <MapComponent />
                    <div className="absolute top-0 left-0 w-full h-8 bg-liner-to-b from-gray-900/40 to-transparent pointer-events-none z-1000"></div>
                </main>
            </div>
        </AuthGuard>
    );
}