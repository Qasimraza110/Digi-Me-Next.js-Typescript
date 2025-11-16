// app/reset/page.tsx
"use client"; // Only if you need client hooks for form and toast

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useSearchParams } from "next/navigation";

// Helper function for styled toast
const showToast = (type: "error" | "success", message: string) => {
  toast[type](message, {
    style: {
      border: "1px solid #B306A7",
      padding: "10px 20px",
      color: "#fff",
      background: "linear-gradient(90deg, #B306A7 0%, #4C0593 100%)",
    },
  });
};

// // Props passed by Next.js App Router
// interface ResetPageProps {
//   searchParams: { token?: string };
// }

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");  // ✅ Correct for client component
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast("error", "Invalid or missing token.");
      return;
    }

    if (password !== confirmPassword) {
      showToast("error", "Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/password/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password, confirmPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("success", "Password updated successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        showToast("error", data?.message || "Failed to reset password. Try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast("error", "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex justify-center items-center bg-gradient-to-br from-white via-[#F9F9FB] to-[#EDEAF8]">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Background */}
      <div className="absolute inset-0 bg-[url('/merge.svg')] bg-top-center bg-cover bg-no-repeat" />

      {/* Overlay */}
      <div
        className="absolute bg-[url('/loginlogo.svg')] bg-no-repeat bg-contain w-[30%] h-full top-0 right-0"
      />

      {/* Container */}
      <div className="relative flex flex-col lg:flex-row justify-center items-center w-full lg:w-[1200px] px-6 gap-12 z-10">
        {/* LEFT SECTION */}
        <div className="hidden lg:flex flex-col space-y-6 -ml-16">
          <div className="flex items-center space-x-4">
            <Image src="/group.svg" alt="Logo" width={83} height={74} />
            <h1 className="font-bold text-black text-[48px] leading-[58px]">
              DigiMe
              <span className="inline-block w-3 h-3 bg-black rounded-full ml-1"></span>
            </h1>
          </div>
          <p className="text-black font-roboto font-bold text-[48px] leading-[64px] capitalize max-w-[580px]">
            Just some details to <br />
            <span className="text-[#AD06A6]">get you in!</span>
          </p>
        </div>

        {/* RIGHT SECTION (FORM) */}
        <form
          onSubmit={handleResetPassword}
          className="flex flex-col space-y-6 p-8 rounded-[20px] custom-bg w-full max-w-md"
        >
          <h1 className="font-bold text-gray-800 text-[28px] mb-2 text-center">
            Reset Password
          </h1>

          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password*
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md pr-12"
            />
            <div
              className="absolute right-4 top-[38px] cursor-pointer text-gray-500 hover:text-purple-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password*
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md pr-12"
            />
            <div
              className="absolute right-4 top-[38px] cursor-pointer text-gray-500 hover:text-purple-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-bold py-3 rounded-lg transition-all"
            style={{
              background: "linear-gradient(90deg, #B306A7 0%, #4C0593 100%)",
            }}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}