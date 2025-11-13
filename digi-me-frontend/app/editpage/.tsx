"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateUsername,
  validateEmail,
  validatePhone,
  validateBio,
  validateSocialLink,
} from "@/utils/validation";

export default function ProfilePage() {
  const router = useRouter();
  const API = "http://localhost:5000";

  // --- states ---
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerImage, setBannerImage] = useState<string>("/bgpic.jpg");
  const [profilePreview, setProfilePreview] = useState<string>("/user.png");
  const [hasBannerError, setHasBannerError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  const platforms = ["Facebook", "Instagram", "LinkedIn", "WhatsApp"];
  const [socialLinks, setSocialLinks] = useState([
    { name: "facebook", url: "" },
    { name: "instagram", url: "" },
    { name: "linkedin", url: "" },
    { name: "whatsapp", url: "" },
  ]);

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    phone: false,
    bio: false,
  });
  const [socialErrors, setSocialErrors] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  const toastStyle = {
    style: {
      background: "linear-gradient(to right, #B306A7, #4C0593)",
      color: "#fff",
      fontWeight: "bold",
    },
  };

  // --- scale effect ---
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1440;
      const scale = Math.min(window.innerWidth / baseWidth, 1);
      document.documentElement.style.setProperty("--scale", scale.toString());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- load profile ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser(data);

        if (data.avatarUrl) setProfilePreview(`${API}${data.avatarUrl}`);
        if (data.coverAvatar) setBannerImage(`${API}${data.coverAvatar}`);

        const linksObj = data.socialLinks || {};
        setSocialLinks([
          { name: "facebook", url: linksObj.facebook || "" },
          { name: "instagram", url: linksObj.instagram || "" },
          { name: "linkedin", url: linksObj.linkedin || "" },
          { name: "whatsapp", url: linksObj.whatsapp || "" },
        ]);
      } catch (err) {
        console.error("Profile load error:", err);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  // --- remaining handlers (banner/profile/input/update) remain same ---
  // ... [your existing handlers stay unchanged] ...

  // ---------- Render ----------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white relative">
        <div className="relative">
          <Image src="/group.svg" alt="Logo" width={100} height={100} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-black text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    // ✅ flex container with min-h-screen
    <div className="flex flex-col min-h-screen bg-white">
      <ToastContainer />

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-16 lg:px-[75px]">
        <NavBar />

        <div
          className="fixed top-0 right-0 w-[25%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
          style={{ zIndex: 1 }}
        />
        <div
          className="fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-no-repeat bg-contain bg-bottom pointer-events-none"
          style={{ zIndex: 1 }}
        />

        {/* Main profile content */}
        <div className="relative max-w-[1440px] mx-auto">
          {/* ... rest of your profile content including banner, profile pic, inputs, social links, buttons ... */}
        </div>
      </div>

      {/* Footer at bottom */}
      <Footer />
    </div>
  );
}
