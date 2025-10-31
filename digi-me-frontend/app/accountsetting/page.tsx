"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "@/components/navbar/page";
import Footer from "@/components/footer/page";

export default function AccountSettingPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  // ✅ Scale layout like profile page
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

  // ✅ Fetch user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile/account/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            username: userData.username || "",
            email: userData.email || "",
            password: "",
          });
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ✅ Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Save updated data
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 1000,
          style: {
            background: "linear-gradient(to right, #B306A7, #4C0593)",
            color: "#fff",
            fontWeight: 500,
            borderRadius: "12px",
          },
          onClose: () => router.push("/profile"),
        });
      } else {
        toast.error("Failed to update profile", {
          position: "top-right",
          autoClose: 2000,
          style: { background: "#1E1E1E", color: "#fff", borderRadius: "12px" },
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating profile", {
        position: "top-right",
        autoClose: 2000,
        style: { background: "#1E1E1E", color: "#fff", borderRadius: "12px" },
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      password: "",
    });
  };

  // ✅ Loader screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white relative">
        <div className="relative">
          {/* Center logo */}
          <Image src="/group.svg" alt="Logo" width={100} height={100} className="z-10" />
          {/* Rotating pink loader ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-gray-800 text-lg font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative" >
       <div className="flex justify-center items-start flex-1 relative">
             <div
        className="fixed top-0 right-0 w-[25%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
        style={{ zIndex: 1 }}
      ></div>

      {/* Left floating image */}
      <div
        className="fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-no-repeat bg-contain bg-bottom pointer-events-none"
        style={{ zIndex: 1 }}
      ></div>

      {/* Main content */}
      <div
        className="relative"
        style={{
          width: "1440px",
          height: "1024px",
          transformOrigin: "top center",
          transform: "scale(var(--scale, 1))",
          transition: "transform 0.2s ease-out",
        }}
      >
        <NavBar />
        <ToastContainer />

        <h1 className="absolute top-[139px] left-[100px] font-roboto font-medium text-[32px] capitalize text-[#1E1E1E]">
          Account Settings
        </h1>

        {/* Divider lines */}
        <div className="absolute top-[196px] left-[100px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>
        <div className="absolute top-[320px] left-[100px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>
        <div className="absolute top-[444px] left-[100px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>

        {/* Inputs section */}
        <div className="absolute top-[221px] left-[100px] space-y-[40px]">
          <div className="flex flex-wrap gap-[40px]">
            {/* Username */}
            <div className="flex flex-col">
              <label className="text-[16px] font-roboto font-medium text-[#1E1E1E] mb-[8px]">User Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Alexa David"
                className="w-[608px] h-[48px] rounded-[16px] bg-[#F8F8F8] border border-[#EEEEEE] px-[16px] text-[16px] text-[#1E1E1E] placeholder:text-[#AEAEAE] focus:outline-none focus:ring-2 focus:ring-[#B007A7]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-[16px] font-roboto font-medium text-[#1E1E1E] mb-[8px]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="alexadavid@Email.Com"
                className="w-[608px] h-[48px] rounded-[16px] bg-[#F8F8F8] border border-[#EEEEEE] px-[16px] text-[16px] text-[#1E1E1E] placeholder:text-[#AEAEAE] focus:outline-none focus:ring-2 focus:ring-[#B007A7]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-[16px] font-roboto font-medium text-[#1E1E1E] mb-[8px]">Password</label>
            <div className="relative w-[608px]">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••••••"
                className="w-[608px] h-[48px] rounded-[16px] bg-[#F8F8F8] border border-[#EEEEEE] px-[16px] text-[16px] text-[#1E1E1E] placeholder:text-[#AEAEAE] focus:outline-none focus:ring-2 focus:ring-[#B007A7] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#AEAEAE] hover:text-[#4C0593]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute top-[478px] left-[1000px] flex gap-[16px]">
          <button
            onClick={handleCancel}
            className="w-[162px] h-[48px] rounded-[16px] bg-[#F8F8F8] text-[#1E1E1E] font-roboto font-medium hover:bg-[#EDEDED] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-[162px] h-[48px] rounded-[16px] bg-gradient-to-r from-[#B306A7] to-[#4C0593] text-white font-roboto font-medium hover:opacity-90 transition-all shadow-md"
          >
            Update Profile
          </button>
        </div>
      </div>
       </div>
      {/* Right floating image */}
 <Footer />
    </div>
  );
}
