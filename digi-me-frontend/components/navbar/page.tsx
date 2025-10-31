"use client";

import { User, Bookmark, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();

  const handleProfileClick = () => router.push("/profile");
  const handleSavedProfilesClick = () => router.push("/savedprofile");
  const handleLogout = () => router.push("/login");

  return (
    <nav className="w-full flex items-center justify-between px-[94px] py-[24px] relative z-50 bg-transparent font-['Roboto']">
      {/* LEFT SIDE - Logo + Text */}
      <div
        onClick={handleProfileClick} // 🔹 Make logo clickable
        className="flex items-center gap-[6px] cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          width: "174px",
          height: "70px",
          position: "relative",
        }}
      >
        {/* Logo */}
        <img
          src="/group.svg"
          alt="DigiMe Logo"
          className="w-[47.31px] h-[41.94px] object-contain"
        />

        {/* Title */}
        <span
          className="text-[28px] font-semibold text-[#1E1E1E] tracking-wide"
          style={{
            fontFamily: "Roboto, sans-serif",
          }}
        >
          DigiMe.
        </span>
      </div>

      {/* RIGHT SIDE - Buttons */}
      <div
        className="flex items-center"
        style={{
          width: "426px",
          height: "48px",
          gap: "16px",
          position: "relative",
        }}
      >
        {/* My Profile Button */}
        <button
          onClick={handleProfileClick}
          className="flex items-center justify-center rounded-[16px] text-white font-medium gap-[12px] px-[24px] py-[12px] transition-all hover:opacity-90 hover:scale-105"
          style={{
            width: "158px",
            height: "48px",
            background:
              "linear-gradient(90.11deg, #B007A7 0.1%, #4F0594 94.91%)",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          <User size={20} />
          My Profile
        </button>

        {/* Saved Profiles Button */}
        <button
          onClick={handleSavedProfilesClick}
          className="flex items-center justify-center rounded-[16px] text-[#1E1E1E] font-medium gap-[12px] px-[24px] py-[12px] transition-all hover:bg-gray-200 hover:scale-105"
          style={{
            width: "188px",
            height: "48px",
            background: "rgba(0, 0, 0, 0.05)",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          <Bookmark size={20} />
          Saved Profiles
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center rounded-full transition-all hover:opacity-40 hover:scale-110"
          style={{
            width: "48px",
            height: "48px",
            background: " #FA5050",
            opacity: 0.27,
          }}
        >
          <LogOut
            size={20}
            strokeWidth={2.3}
            className="rotate-180 text-red-700"
            style={{
              transform: "rotate(180deg)",
              opacity: 1,
            }}
          />
        </button>
      </div>
    </nav>
  );
}
