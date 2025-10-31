import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DigiMe - Your Digital Identity",
  description: "Connect with others through your personalized digital profile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ Wrap the entire app in GoogleOAuthProvider */}
        <GoogleOAuthProvider clientId="886314339765-4krud7b7jn2mg5ooahcjiha0nqkb6l3k.apps.googleusercontent.com">
          {children}
           <Toaster position="top-right" reverseOrder={false} />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
