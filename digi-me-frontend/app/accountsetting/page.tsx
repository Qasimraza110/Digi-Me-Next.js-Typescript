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

  // ✅ Fetch user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/profile/account/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          password: "",
        });
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:5000/api/profile/account/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) return toast.error("Failed to update profile");
      toast.success("Profile updated!", {
        autoClose: 1000,
        onClose: () => router.push("/profile"),
      });
    } catch {
      toast.error("Error updating profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      password: "",
    });
  };

  if (isLoading)
    return (
     <div className="flex flex-col items-center justify-center h-screen bg-white relative">
             <div className="relative">
               <Image
                 src="/group.svg"
                 alt="Logo"
                 width={100}
                 height={100}
                 className="z-10"
               />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin"></div>
             </div>
             <p className="mt-6 text-white text-lg">Loading profile...</p>
           </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <ToastContainer />

      <div className="relative flex-1 flex justify-center items-start overflow-auto px-4 py-10">
        {/* floating shapes hidden on mobile */}
        <div className="hidden lg:block fixed top-0 right-0 w-[20%] h-[50vh] bg-[url('/accountpage.svg')] bg-contain bg-no-repeat" />
        <div className="hidden lg:block fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-contain bg-no-repeat" />

    
        <div className="w-full max-w-[1440px] relative">
          <h1 className="mt-1 ml-5 text-[32px] font-medium text-[#1E1E1E]">
            Account Settings
          </h1>
          <div className="border-b my-4 ml-6 max-w-[90%]" />

          <div className="mt-7 ml-5 flex flex-col space-y-10 max-w-[90%]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className="mb-2 text-black text-[16px] font-medium">
                  User Name
                </label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="h-12 rounded-[16px] bg-[#F8F8F8] text-black border border-gray-300 px-4 placeholder:text-gray-400"
                  placeholder="Enter name"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 text-black text-[16px] font-medium">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 rounded-[16px] bg-[#F8F8F8] text-black border border-gray-300 px-4 placeholder:text-gray-400"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="flex flex-col max-w-[608px]">
              <label className="mb-2 text-black text-[16px] font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-12 rounded-[16px] bg-[#F8F8F8]  text-black border border-gray-300 px-4 placeholder:text-gray-400 pr-10"
                  placeholder="••••••••"
                  text-color="gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 justify-end pr-6">
              <button
                onClick={handleCancel}
                className="h-12 w-[162px] text-gray-400 rounded-[16px] bg-[#F8F8F8]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-12 w-[162px] rounded-[16px] bg-gradient-to-r from-[#B306A7] to-[#4C0593] text-white"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
