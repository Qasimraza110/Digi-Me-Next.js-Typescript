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
<div className="min-h-screen bg-white flex items-center justify-center">
  <div className="text-center text-black">
    {/* Image + Heading */}
    <div className="flex items-center justify-center space-x-3 mb-4">
      <img
        src="/group.svg"          // make sure the path is correct
        alt="DigiMe Logo"
        className="w-10 h-10"     // adjust size as you like
      />
      <h1 className="text-4xl font-bold">DigiMe</h1>
    </div>

    {/* Redirect text
    <p className="text-black">Redirecting...</p> */}
  </div>
</div>

  );
}
