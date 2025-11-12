"use client";

import { User, Bookmark, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify"; // optional if you want logout message

export default function NavBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleProfileClick = () => {
    setOpen(false);
    router.push("/profile");
  };

  const handleSavedProfilesClick = () => {
    setOpen(false);
    router.push("/savedprofile");
  };

  const handleLogout = () => {
    // ✅ Step 1: Clear token & user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ✅ Step 2: Close menu
    setOpen(false);

    // ✅ Step 3: Optional toast message
    // toast.success("Logged out successfully!");

    // ✅ Step 4: Redirect to login
    router.push("/login");
  };

  return (
    <nav className="w-full flex items-center justify-between px-[94px] py-[24px] relative z-50 bg-transparent font-['Roboto'] max-[768px]:px-4">
      {/* LEFT SIDE LOGO */}
      <div
        onClick={handleProfileClick}
        className="flex items-center gap-[6px] cursor-pointer hover:opacity-80 transition-opacity"
        style={{ width: "174px", height: "70px", position: "relative" }}
      >
        <img
          src="/group.svg"
          alt="DigiMe Logo"
          className="w-[47.31px] h-[41.94px] object-contain"
        />
        <span
          className="text-[28px] font-semibold text-[#1E1E1E] tracking-wide"
          style={{ fontFamily: "Roboto, sans-serif" }}
        >
          DigiMe.
        </span>
      </div>

      {/* DESKTOP BUTTONS */}
      <div
        className="flex items-center max-[768px]:hidden"
        style={{
          width: "426px",
          height: "48px",
          gap: "16px",
          position: "relative",
        }}
      >
        <button
          onClick={handleProfileClick}
          className="flex items-center justify-center cursor-pointer rounded-[16px] text-white font-medium gap-[12px] px-[24px] py-[12px] transition-all hover:opacity-90 hover:scale-105"
          style={{
            width: "158px",
            height: "48px",
            background:
              "linear-gradient(90.11deg, #B007A7 0.1%, #4F0594 94.91%)",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          <User size={20} /> My Profile
        </button>

        <button
          onClick={handleSavedProfilesClick}
          className="flex items-center justify-center cursor-pointer rounded-[16px] text-[#1E1E1E] font-medium gap-[12px] px-[24px] py-[12px] transition-all hover:bg-gray-200 hover:scale-105"
          style={{
            width: "188px",
            height: "48px",
            background: "rgba(0, 0, 0, 0.05)",
            fontFamily: "Roboto, sans-serif",
          }}
        >
          <Bookmark size={20} /> Saved Profiles
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center cursor-pointer rounded-full transition-all hover:opacity-40 hover:scale-110"
          style={{
            width: "48px",
            height: "48px",
            background: "#FA5050",
            opacity: 0.27,
          }}
        >
          <LogOut size={20} strokeWidth={2.3} className="rotate-180 text-red-700" />
        </button>
      </div>

      {/* MOBILE MENU ICON */}
      <button onClick={() => setOpen(true)} className="hidden max-[768px]:flex">
        <Menu size={30} className="text-gray-500" />
      </button>

      {/* MOBILE SIDEBAR */}
      {open && (
        <>
          {/* BG OVERLAY */}
          <div
            className="fixed inset-0 bg-black/30 z-[90]"
            onClick={() => setOpen(false)}
          ></div>

          {/* SIDEBAR */}
          <div className="fixed top-0 right-0 w-[250px] h-full bg-white border-l border-gray-300 shadow-2xl z-[100] flex flex-col p-6 gap-6 font-['Roboto']">
            <button
              className="self-end text-xl mb-3 text-gray-500"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <button
              onClick={handleProfileClick}
              className="flex items-center text-black gap-3 text-lg font-medium"
            >
              <User size={22} /> My Profile
            </button>

            <button
              onClick={handleSavedProfilesClick}
              className="flex items-center text-black gap-3 text-lg font-medium"
            >
              <Bookmark size={22} /> Saved Profiles
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-lg font-medium text-red-600"
            >
              <LogOut size={22} className="rotate-180" /> Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
