"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/footer/page";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleCredentialResponse {
  credential: string;
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidClientId, setIsValidClientId] = useState(true);
  const [redirectTo, setRedirectTo] = useState("/login"); // <-- safe initial value

  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // 🔹 Get redirect query param safely in useEffect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "/login";
    setRedirectTo(redirect);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: fullName, email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      // ✅ Save token to localStorage if backend returns it
      if (data.token) localStorage.setItem("token", data.token);

      toast.success("Registration successful!", {
        style: {
          background: "linear-gradient(to right, #9333EA, #EC4899)",
          color: "#fff",
        },
      });

      // ✅ Redirect directly after signup
      setTimeout(() => router.push(redirectTo), 2000);
    } else {
      toast.error(data.message || "Registration failed!", {
        style: {
          background: "linear-gradient(to right, #9333EA, #EC4899)",
          color: "#fff",
        },
      });
    }
  } catch (err) {
    toast.error("Registration failed. Please try again.", {
      style: {
        background: "linear-gradient(to right, #9333EA, #EC4899)",
        color: "#fff",
      },
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleCredentialResponse = async (
    response: GoogleCredentialResponse
  ) => {
    if (!navigator.onLine) {
      toast.error("You're offline. Please connect to the internet.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.msg || "Google Sign-in successful!");
        if (data.token) localStorage.setItem("token", data.token);
        router.push("/profile");
      } else toast.error(data.message || "Google Sign-in failed.");
    } catch {
      toast.error("Google Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Google script initialization
  useEffect(() => {
    if (document.getElementById("google-client-script")) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = "google-client-script";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id:
              "886314339765-4krud7b7jn2mg5ooahcjiha0nqkb6l3k.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });
          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: "outline",
              size: "large",
              shape: "rectangular",
              width: 200,
            });
          }
          window.google.accounts.id.prompt();
        } catch {
          setIsValidClientId(false);
        }
      } else setIsValidClientId(false);
    };

    document.head.appendChild(script);
    return () => {
      if (window.google?.accounts.id) window.google.accounts.id.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      {/* Background */}
      <div className="absolute inset-0 bg-[url('/merge.svg')] bg-top bg-cover bg-no-repeat -z-10" />

      {/* Overlay for desktop */}
      <div className="hidden lg:block absolute bg-[url('/loginlogo.svg')] bg-contain bg-no-repeat w-[25%] h-full top-0 right-0 -z-10" />

      {/* Mobile top branding */}
      <div className="lg:hidden relative z-10 flex flex-col p-4 pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Image
            src="/group.svg"
            alt="Logo"
            width={50}
            height={45}
            className="object-contain"
          />
          <h1 className="font-bold text-black text-[30px] leading-[28px]">
            DigiMe
            <span className="inline-block w-2 h-2 bg-black rounded-full ml-1"></span>
          </h1>
        </div>
        <p className="text-black font-roboto font-bold text-[30px] sm:text-[24px] leading-[28px]">
          Just some details to{" "}
          <span className="text-[#AD06A6] block lg:inline mt-1 lg:mt-0">
            get you in!
          </span>
        </p>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row justify-center items-stretch relative z-10">
        {/* LEFT SECTION (Desktop Only, slightly right) */}
       <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-16 translate-x-8">
  <div className="flex items-center space-x-4 mb-6">
    <Image
      src="/group.svg"
      alt="Logo"
      width={83}
      height={74}
      className="object-contain"
    />
    <h1 className="font-bold text-black text-[48px] leading-[58px]">
      DigiMe
      <span className="inline-block w-3 h-3 bg-black rounded-full ml-1"></span>
    </h1>
  </div>
  <p className="text-black font-roboto font-bold text-[28px] sm:text-[36px] lg:text-[48px] leading-[36px] sm:leading-[48px] lg:leading-[64px]">
    Just some details to
    <span className="text-[#AD06A6] block lg:block mt-2 lg:mt-4">
      get you in!
    </span>
  </p>
</div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-4 lg:p-16 relative z-10">
          <FormUI
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleRegister={handleRegister}
            googleButtonRef={googleButtonRef}
            isValidClientId={isValidClientId}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Footer only for mobile */}
      <div className="lg:hidden relative z-10">
        <Footer />
      </div>
    </div>
  );
}

function FormUI({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleRegister,
  googleButtonRef,
  isValidClientId,
  isLoading,
}: any) {
  return (
    <form
      onSubmit={handleRegister}
      className="w-full max-w-[480px] flex flex-col space-y-5 p-6 sm:p-8 rounded-[20px] shadow-xl custom-bg"
    >
      <h1 className="font-bold text-gray-800 text-[28px] sm:text-[30px] text-left mb-2">
        Sign Up!
      </h1>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Name*
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your user name"
          className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address*
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password*
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-[14px] rounded-lg outline-none focus:ring-2 focus:ring-purple-500 pr-12 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md"
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-purple-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={22} />
            ) : (
              <AiOutlineEye size={22} />
            )}
          </div>
        </div>
      </div>

      {/* Register Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 mt-2"
      >
        {isLoading ? "Registering…" : "Register Now"}
      </button>

      <p className="text-center text-[#1E1E1E] font-roboto font-medium text-[16px] mt-2">
        Or Continue With
      </p>

      {/* Google Button */}
      <div
        ref={googleButtonRef}
        className={`flex items-center justify-center rounded-[12px] mx-auto transition w-full max-w-[400px] h-[65px] ${
          isValidClientId
            ? "hover:bg-gray-50/10 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        {!isValidClientId && (
          <span className="ml-2 text-sm text-gray-500">(Not configured)</span>
        )}
      </div>

      {/* Login Link */}
      <div className="flex justify-center mt-2">
        <p className="font-medium text-[16px] text-[#1E1E1E]">
          Already have an account?
          <a href="/login" className="text-[#AD06A6] ml-1 font-medium">
            Login
          </a>
        </p>
      </div>
    </form>
  );
}
