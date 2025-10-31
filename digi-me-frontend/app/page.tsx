'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg- flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">DigiMe</h1>
        <p className="text-gray-300">Redirecting...</p>
      </div>
    </div>
  );
}
