"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // 🔹 Normal registration
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
        toast.success("Registration successful!", {
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(data.message || "Registration failed!", {
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
      }
    } catch (error) {
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

  // 🔹 Handle Google credential response
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
        // ✅ Store token (optional)
        if (data.token) localStorage.setItem("token", data.token);
        router.push("/profile");
      } else {
        toast.error(data.message || "Google Sign-in failed.");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load Google script safely
  useEffect(() => {
    // Prevent duplicate script
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
            auto_select: false, // ✅ prevents unwanted auto-login popups
          });

          // Render button
          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: "outline",
              size: "large",
              shape: "rectangular",
              width: 472,
            });
          }

          // Optionally prompt one-tap
          window.google.accounts.id.prompt();
        } catch (err) {
          console.error("Google init error:", err);
          setIsValidClientId(false);
        }
      } else {
        console.error("Google SDK not found");
        setIsValidClientId(false);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (window.google?.accounts.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  return (
    <div className="h-screen w-full relative">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      {/* Background */}
      <div className="absolute inset-0 bg-[url('/merge.svg')] bg-top-center  bg-cover bg-no-repeat"></div>

      {/* Overlay */}
        <div
        className="absolute bg-[url('/loginlogo.svg')] bg-no-repeat bg-contain w-[25%] h-full top-0 right-0"
       
      ></div> 

      {/* Layout */}
      <div className="relative flex justify-center items-center h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full lg:w-[1280px] px-4 mx-auto">
          {/* LEFT SECTION */}
          <div className="hidden lg:block col-span-1 relative">
            <div className="absolute" style={{ top: "100px", left: "60px" }}>
              <div className="flex items-center space-x-4">
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
              <div className="mt-12 max-w-[580px]">
                <p className="text-black font-roboto font-bold text-[48px] leading-[64px] capitalize">
                  Just some details to{" "}
                  <span className="text-[#AD06A6]">get you in!</span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="col-span-1 flex justify-center items-center pt-8 lg:pt-0">
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
      className="relative flex flex-col justify-start space-y-5 p-8 rounded-[20px] shadow-xl mt-[-40px]  custom-bg"
     
    >
      <h1 className="font-bold text-gray-800 text-[30px] text-left mb-[10px]">
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
          onChange={(e: any) => setFullName(e.target.value)}
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
          onChange={(e: any) => setEmail(e.target.value)}
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
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-[14px] rounded-lg outline-none focus:ring-2 focus:ring-purple-500 pr-12 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md"
          />
          <div
            className="absolute right-4 top-1/2 -translate-y-[52%] cursor-pointer text-gray-500 hover:text-purple-600 transition"
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

      {/* Divider */}
      <p className="text-center text-[#1E1E1E] font-roboto font-medium text-[16px]">
        Or Continue With
      </p>

      {/* Google Button */}
      <div
        ref={googleButtonRef}
        className={`flex items-center justify-center rounded-[12px] mx-auto transition backdrop-blur-sm ${
          isValidClientId
            ? "hover:bg-gray-50/10 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
        style={{
          width: "472px",
          height: "65px",
          gap: "10px",
          background: "transparent",
        }}
      >
        {/* <Image src="/google.svg" alt="Google" width={42} height={42} /> */}
        {!isValidClientId && (
          <span className="ml-2 text-sm text-gray-500">(Not configured)</span>
        )}
      </div>

      {/* Login Link */}
      <div className="flex justify-center mt-[-4px]">
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