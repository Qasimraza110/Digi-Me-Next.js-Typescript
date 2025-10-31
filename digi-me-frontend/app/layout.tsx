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
      <head>
  {/* ✅ Use your group.svg as favicon */}
  <link rel="icon" href="/group.svg" type="image/svg+xml" />

  {/* Optional PNG fallback if browser doesn't support SVG favicon */}
  <link rel="icon" type="image/png" href="/group.png" />

  {/* ✅ Apple icon (iOS homescreen) */}
  <link rel="apple-touch-icon" href="/group.png" />

  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#000000" />

  <meta 
    name="description"
    content="DigiMe - Smart Digital Profile and Networking Platform"
  />

  <title>DigiMe</title>
</head>

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
