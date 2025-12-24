'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;

    useEffect(() => {
        if (!hasToken) {
            router.replace('/login');
        }
    }, [hasToken, router]);

    if (!hasToken) {
        return null;
    }

    return <>{children}</>;
}