'use client';
import { useState } from 'react';
import api from '@/app/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            router.push('/dashboard'); // Where your map will live
        } catch (err) {
            alert("Invalid credentials" + err);
        }
    };

    return (
        <main className="flex min-h-screen bg-gray-900 text-white">
            {/* LEFT SIDE: Branding & Description */}
            <div className="hidden lg:flex flex-col justify-center px-12 w-1/2 bg-blue-600/5 border-r border-gray-800">
                <div className="max-w-md">
                    <Image src="/streetsync.png" alt="Logo" width={60} height={60} className="mb-6" />
                    <h1 className="text-5xl font-black mb-4">
                        STREET<span className="text-blue-500">SYNC</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        Real-time community-driven road hazard tracking.
                        See potholes, accidents, and delays before you hit them.
                    </p>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:hidden">
                        <h1 className="text-3xl font-bold text-blue-500">StreetSync</h1>
                    </div>

                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

                        {/* Your Existing Form Components Here */}
                        <form className="space-y-4" onSubmit={handleLogin}>
                            <input type="email" placeholder="Email" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" onChange={(e) => setEmail(e.target.value)} />
                            <input type="password" placeholder="Password" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" onChange={(e) => setPassword(e.target.value)} />
                            <button className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700" type='submit'>
                                Login
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-400">
                            Don&apos;t have an account? <Link href="/signup" className="text-blue-500 hover:underline">Create Account</Link>
                        </p>
                    </div>

                    {/* Mobile-only description text */}
                    <p className="lg:hidden text-center text-xs text-gray-500 px-4">
                        Real-time community-driven road hazard tracking.
                    </p>
                </div>
            </div>
        </main>
    );
}