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
import { validatePassword } from "@/utils/validation";

export default function AccountSettingPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
  });

  // ✅ Fetch user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile/account/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // ✅ Handle Input Change + Validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "username") {
        const usernameStr = value.trim();
        const isValid =
          usernameStr.length >= 3 &&
          usernameStr.length <= 20 &&
          /^[A-Za-z0-9_ ]+$/.test(usernameStr) &&
          !usernameStr.startsWith("_") &&
          !usernameStr.startsWith(" ") &&
          !usernameStr.endsWith("_") &&
          !usernameStr.endsWith(" ") &&
          !usernameStr.includes("__") &&
          !usernameStr.includes("  ");
        newErrors.username = !isValid;
      }

      if (name === "email") {
        newErrors.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      }

      if (name === "password") {
        if (!value.trim()) newErrors.password = false;
        else {
          const pwdCheck = validatePassword(value);
          newErrors.password = !pwdCheck.isValid;
        }
      }

      return newErrors;
    });
  };

  // ✅ Handle Save
  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    if (errors.username || errors.email || errors.password) return;

    setIsUpdating(true);

    const payload: any = {
      username: formData.username.trim(),
      email: formData.email.trim(),
    };
    if (formData.password.trim()) payload.password = formData.password.trim();

    try {
      const res = await fetch("http://localhost:5000/api/profile/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update profile", {
          style: {
            background: "linear-gradient(to right, #B306A7, #4C0593)",
            color: "#fff",
            fontWeight: "bold",
          },
        });
        setIsUpdating(false);
        return;
      }

      // ✅ Detect email or password change → logout required
      const emailChanged = data.emailChanged || formData.email !== user?.email;
      const passwordChanged = !!formData.password?.trim();

      if (emailChanged || passwordChanged) {
        localStorage.removeItem("token");
        toast.success("Account updated! Please log in again.", {
          style: {
            background: "linear-gradient(to right, #B306A7, #4C0593)",
            color: "#fff",
            fontWeight: "bold",
          },
          autoClose: 1500,
          onClose: () => router.push("/login"),
        });
      } else {
        toast.success("Profile updated successfully!", {
          style: {
            background: "linear-gradient(to right, #B306A7, #4C0593)",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile", {
        style: {
          background: "linear-gradient(to right, #FF4E50, #F9D423)",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Reset Form
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
        <p className="mt-6 text-black text-lg">Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      <ToastContainer />

      <div className="relative flex-1 flex justify-center items-start overflow-auto px-4 py-10">
        <div className="hidden lg:block fixed top-0 right-0 w-[20%] h-[50vh] bg-[url('/accountpage.svg')] bg-contain bg-no-repeat" />
        <div className="hidden lg:block fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-contain bg-no-repeat" />

        <div className="w-full max-w-[1440px] relative">
          <h1 className="mt-1 ml-5 text-[32px] font-medium text-[#1E1E1E]">
            Account Settings
          </h1>
          <div className="border-b my-4 ml-6 max-w-[90%]" />

          <div className="mt-7 ml-5 flex flex-col space-y-10 max-w-[90%]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Username */}
              <div className="flex flex-col">
                <label className="mb-2 text-black text-[16px] font-medium">
                  User Name
                </label>
                <div className="flex flex-col">
  <input
    name="username"
    type="text"
    value={formData.username}
    onChange={handleInputChange}
    className={`h-12 rounded-[16px] bg-[#F8F8F8] text-black border px-4 placeholder:text-gray-400 ${
      errors.username ? "border-red-500" : "border-gray-300"
    }`}
    placeholder="Enter username"
  />
  {/* Always render the <p>, use empty string if no error */}
  <p className="text-red-500 text-sm font-medium ml-2 min-h-[1.25rem]">
    {errors.username ? "Username can only contain letters, numbers, and underscores" : ""}
  </p>
</div>

              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="mb-2 text-black text-[16px] font-medium">
                  Email
                </label>
              <div className="flex flex-col">
  <input
    name="email"
    type="email"
    value={formData.email}
    onChange={handleInputChange}
    className={`h-12 rounded-[16px] bg-[#F8F8F8] text-black border px-4 placeholder:text-gray-400 ${
      errors.email ? "border-red-500" : "border-gray-300"
    }`}
    placeholder="Enter email"
  />
  {/* Reserve fixed height for error message to prevent layout shift */}
  <p className="text-red-500 text-sm font-medium ml-2 min-h-[1.25rem]">
    {errors.email ? "Please enter a valid email" : ""}
  </p>
</div>

              </div>
            </div>

            {/* Password */}
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
                  className={`w-full h-12 rounded-[16px] bg-[#F8F8F8] text-black px-4 pr-10 placeholder:text-gray-400 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm font-medium ml-2 min-h-[1.25rem]">
                  Password must contain upper, lower, number & special character
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end pr-6">
              <button
                onClick={handleCancel}
                className="h-12 w-[162px] text-gray-400 rounded-[16px] bg-[#F8F8F8]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  isUpdating ||
                  Object.values(errors).some((err) => err) ||
                  !formData.username ||
                  !formData.email
                }
                className={`h-12 w-[162px] rounded-[16px] text-white transition-all ${
                  isUpdating ||
                  Object.values(errors).some((err) => err)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#B306A7] to-[#4C0593]"
                }`}
              >
                {isUpdating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
