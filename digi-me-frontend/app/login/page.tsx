"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import { FaGoogle } from "react-icons/fa";

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

const BACKEND_URL = "http://localhost:5000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidClientId, setIsValidClientId] = useState(true);
  const [redirectTo, setRedirectTo] = useState("/profile"); // <-- default safe value
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // 🔹 Get redirect query param safely in useEffect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(params.get("redirect") || "/profile");
  }, []);

  // 🔹 Load remembered credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    const savedPassword = localStorage.getItem("rememberPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        if (rememberMe) {
          localStorage.setItem("rememberEmail", email);
          localStorage.setItem("rememberPassword", password);
        } else {
          localStorage.removeItem("rememberEmail");
          localStorage.removeItem("rememberPassword");
        }
        toast.success("Login successful!", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
        setTimeout(() => router.push(redirectTo), 1500); // safe redirect
      } else {
        toast.error(data.message || "Invalid credentials", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please try again.", {
        position: "top-right",
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
        toast.success(data.msg || "Google Sign-in successful!", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #B007A7, #4F0594)",
            color: "#fff",
            borderRadius: "10px",
          },
        });
        if (data.token) localStorage.setItem("token", data.token);
        router.push("/profile");
      } else {
        toast.error(data.message || "Google Sign-in failed.", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #B007A7, #4F0594)",
            color: "#fff",
            borderRadius: "10px",
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Google Sign-in failed. Please try again.", {
        position: "top-right",
        style: {
          background: "linear-gradient(to right, #B007A7, #4F0594)",
          color: "#fff",
          borderRadius: "10px",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Google Sign-In initialization
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
    <div className="min-h-screen w-full relative flex flex-col justify-between">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Background */}
      <div className="absolute inset-0 bg-[url('/merge.svg')] bg-cover bg-top bg-no-repeat -z-10" />

      {/* Overlay for desktop */}
      <div className="absolute hidden lg:block bg-[url('/loginlogo.svg')] bg-contain bg-no-repeat w-[25%] h-full top-0 right-0 -z-10" />

      {/* Main content */}
      <div className="relative flex-1 flex flex-col lg:flex-row justify-center items-center px-4 py-8 lg:py-0 z-10">
        <div className="flex flex-col lg:flex-row w-full lg:w-[1280px] mx-auto gap-8 items-center">
          {/* LEFT SECTION */}
          <div className="flex-1 flex flex-col justify-center items-start text-left mb-6 lg:mb-0">
            <div className="flex items-center space-x-4 mb-4 lg:mb-12">
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
            <div className="max-w-[580px]">
              <p className="text-black font-roboto font-bold text-[28px] lg:text-[48px] leading-[36px] lg:leading-[64px] capitalize">
                Log in to access your{" "}
                <span className="text-[#AD06A6]">Personalized</span> profile,
                connect with others.{" "}
                <span className="text-[#AD06A6]">Your Network, Your Way!</span>
              </p>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex-1 flex justify-center items-center w-full">
            <FormUI
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              handleLogin={handleLogin}
              googleButtonRef={googleButtonRef}
              isValidClientId={isValidClientId}
              isLoading={isLoading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
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
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  handleLogin,
  googleButtonRef,
  isValidClientId,
  isLoading,
  showPassword,
  setShowPassword,
}: any) {
  return (
    <form
      onSubmit={handleLogin}
      className="relative flex flex-col justify-start space-y-5 p-6 sm:p-8 rounded-[20px] shadow-xl custom-bg w-full max-w-[550px] sm:max-w-[500px] mx-auto"
    >
      <h1 className="font-bold text-gray-800 text-[30px] text-left mb-2">
        Welcome Back!
      </h1>

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
      <div className="relative w-full">
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
            className="w-full px-4 pr-12 h-12 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md"
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-purple-600"
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

      {/* Remember + Forgot */}
      <div className="flex justify-between items-center mt-1">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-purple-600"
          />
          <span className="text-sm text-gray-600">Remember Me</span>
        </label>
        <a
          href="/forgot"
          className="text-sm text-gray-600 hover:text-purple-600"
        >
          Forgot Password?
        </a>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 mt-2"
      >
        {isLoading ? "Logging in…" : "Login"}
      </button>

      {/* Divider */}
      <p className="text-center text-[#1E1E1E] font-roboto font-medium text-[16px] mt-2">
        Or Login With
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


      {/* <div className="cursor-pointer" ref={googleButtonRef}>
        <div className="bg-white py-2.5 rounded-md flex justify-center items-center gap-5">
          {!isValidClientId && (
            <span className="ml-2 text-sm text-gray-500 truncate">
              (Not configured)
            </span>
          )}
          <h1 className="text-black">
            <FaGoogle />
          </h1>
          <h1 className="text-black">Sign in with Google</h1>
        </div>
      </div> */}

      {/* Signup Link */}
      <div className="flex justify-center mt-2">
        <p className="font-medium text-[16px] text-[#1E1E1E]">
          Don’t have an account?
          <a
            href="/register"
            className="text-[#AD06A6] ml-1 font-medium no-underline"
          >
            Signup
          </a>
        </p>
      </div>
    </form>
  );
}
