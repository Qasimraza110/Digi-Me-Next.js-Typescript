"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Footer from "@/components/footer/page";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset link sent successfully to your email!", {
          style: {
            border: "1px solid #4C0593",
            padding: "10px 20px",
            color: "#fff",
            background: "linear-gradient(90.11deg, #B306A7 0.1%, #4C0593 94.91%)",
          },
          iconTheme: { primary: "#fff", secondary: "#4C0593" },
        });

        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(data?.message || "Failed to send password reset link!", {
          style: {
            border: "1px solid #B306A7",
            padding: "10px 20px",
            color: "#fff",
            background: "linear-gradient(90.11deg, #B306A7 0.1%, #4C0593 94.91%)",
          },
          iconTheme: { primary: "#fff", secondary: "#B306A7" },
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Something went wrong. Please try again.", {
        style: {
          border: "1px solid #B306A7",
          padding: "10px 20px",
          color: "#fff",
          background: "linear-gradient(90.11deg, #B306A7 0.1%, #4C0593 94.91%)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/merge.svg')] bg-top-center bg-cover bg-no-repeat -z-10" />

      {/* Overlay for desktop */}
      <div className="absolute bg-[url('/loginlogo.svg')] bg-no-repeat bg-contain w-[30%] h-full top-0 right-0 hidden lg:block"></div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex relative justify-center items-center h-full">
        <div className="grid grid-cols-2 w-full lg:w-[1280px] px-4 mx-auto">
          {/* Branding */}
          <div className="col-span-1 relative">
            <div className="absolute" style={{ top: "0px", left: "60px" }}>
              <div className="flex items-center space-x-4">
                <Image src="/group.svg" alt="Logo" width={83} height={74} className="object-contain" />
                <h1 className="font-bold text-black" style={{ fontSize: "48px", lineHeight: "58px" }}>
                  DigiMe<span className="inline-block w-3 h-3 bg-black rounded-full ml-1"></span>
                </h1>
              </div>
              <div className="mt-12" style={{ maxWidth: "580px" }}>
  <p
    className="text-black font-roboto"
    style={{ fontWeight: 700, fontSize: "48px", lineHeight: "64px" }}
  >
    Just some details to
  </p>
  <p
    className="text-[#AD06A6] font-roboto"
    style={{ fontWeight: 700, fontSize: "48px", lineHeight: "64px", marginTop: "4px" }}
  >
    get you in!
  </p>
</div>

            </div>
          </div>

          {/* Form */}
          <div className="col-span-1 flex justify-center items-start pt-8 lg:pt-0">
            <form
              onSubmit={handleForgotPassword}
              className="flex flex-col justify-start space-y-5 p-8 rounded-[20px] shadow-xl custom-bg"
              style={{ width: "537px", height: "306px" }}
            >
              <h1 className="font-bold text-gray-800" style={{ fontSize: "30px", textAlign: "left", marginBottom: "10px" }}>
                No Worries!
              </h1>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Please enter your Email Address*</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md"
                  style={{ fontFamily: "Roboto", fontWeight: 400, fontSize: "16px" }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold py-3 rounded-lg mt-2"
                style={{ background: "linear-gradient(90.11deg, #B306A7 0.1%, #4C0593 94.91%)" }}
              >
                {isLoading ? "Sending..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden relative flex flex-col justify-between h-screen px-0 pt-8">
        {/* Branding and Form */}
        <div className="flex flex-col items-center w-full gap-4 px-4">
          {/* Branding */}
          <div className="flex flex-col items-start w-full max-w-[480px] mx-auto">
  <div className="flex items-center space-x-2 mb-2">
    <Image src="/group.svg" alt="Logo" width={50} height={45} className="object-contain" />
    <h1 className="font-bold text-black text-[24px] leading-[28px]">
      DigiMe<span className="inline-block w-2 h-2 bg-black rounded-full ml-1"></span>
    </h1>
  </div>
  
  {/* Text split into two lines */}
  <p className="text-black font-roboto font-bold text-[20px] leading-[28px]">
    Just some details to
  </p>
  <p className="text-[#AD06A6] font-roboto font-bold text-[20px] leading-[28px] mt-1">
    get you in!
  </p>
</div>


          {/* Form */}
          <form
            onSubmit={handleForgotPassword}
            className="w-full max-w-[480px] flex flex-col space-y-5 p-6 sm:p-8 rounded-[20px] shadow-xl custom-bg mx-auto"
          >
            <h1 className="font-bold text-gray-800 text-[28px] sm:text-[30px] mb-2">No Worries!</h1>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Please enter your Email Address*</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 border border-[#D9D9D9]/50 bg-white/10 text-[#1E1E1E] placeholder:text-gray-400 backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold py-3 rounded-lg mt-2"
              style={{ background: "linear-gradient(90.11deg, #B306A7 0.1%, #4C0593 94.91%)" }}
            >
              {isLoading ? "Sending..." : "Reset Password"}
            </button>
          </form>
        </div>

        {/* Footer fixed at bottom */}
        <div className="fixed bottom-0 left-0 w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}
