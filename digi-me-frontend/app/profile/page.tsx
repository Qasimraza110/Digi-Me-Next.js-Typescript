"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Globe, Edit3, Settings, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import NavBar from "@/components/navbar/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Footer from "@/components/footer/page";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);
  const API = "http://localhost:5000";

  // ✅ Scale page for responsive layout
  // useEffect(() => {
  //   const handleResize = () => {
  //     const baseWidth = 1440;
  //     const scale = Math.min(window.innerWidth / baseWidth, 1);
  //     document.documentElement.style.setProperty("--scale", scale.toString());
  //   };
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // ✅ Fetch profile + generate QR from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        setUser(data);
        const url = `${window.location.origin}/profile/${
          data.username || "alexa"
        }`;
        setProfileUrl(url);

        // ✅ get QR from backend
        const qrRes = await fetch("http://localhost:5000/api/qr/generate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const qrData = await qrRes.json();
        setQrCode(qrData.qrCode);
        console.log("User Avatar URL →", data?.avatarUrl); 
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ✅ Download QR Code as PNG
  const handleDownloadQr = async () => {
    try {
      if (qrCode) {
        // ✅ If QR is from backend (Base64 or URL)
        const link = document.createElement("a");
        link.href = qrCode;
        link.download = `${user?.username || "profile"}-qr.png`;
        link.click();
        toast.success("QR Code downloaded!", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #B007A7, #4F0594)",
            color: "#fff",
            borderRadius: "10px",
          },
        });
      } else if (qrRef.current) {
        // ✅ If QR is generated locally via <QRCodeSVG>
        const svg = qrRef.current.querySelector("svg");
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement("canvas");
          const img = document.createElement("img");
          const svgBlob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
          });
          const url = URL.createObjectURL(svgBlob);

          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `${user?.username || "profile"}-qr.png`;
            link.click();

            toast.success("QR Code downloaded!", {
              position: "top-right",
              style: {
                background: "linear-gradient(to right, #B007A7, #4F0594)",
                color: "#fff",
                borderRadius: "10px",
              },
            });
          };
          img.src = url;
        }
      }
    } catch (err) {
      console.error("QR download failed:", err);
      toast.error("❌ Failed to download QR Code", { position: "top-right" });
    }
  };

  // ✅ Copy profile URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success(" Profile URL copied!", {
        position: "top-right",
        style: {
          background: "linear-gradient(to right, #B007A7, #4F0594)",
          color: "#fff",
          borderRadius: "10px",
        },
      });
    } catch {
      toast.error("❌ Failed to copy URL.", { position: "top-right" });
    }
  };

 const getAvatarUrl = (url?: string): string => {
  if (!url) return "/userpic.jpg"; // fallback if no avatar

  // Absolute URLs (Google, GitHub, Cloudinary, etc.)
  if (url.startsWith("http")) return url;

  // Local backend paths like "/uploads/avatar.png"
  if (url.startsWith("/")) return `${API}${url}`;

  // Any other unexpected cases → fallback
  return "/userpic.jpg";
};

  // ✅ Loader with logo + pink rotating circle
  if (isLoading) {
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
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToastContainer />
      <NavBar />

      <div className="relative flex-1 flex justify-center items-start overflow-auto px-4 ">
        <div
          className="fixed top-0 right-0 w-[20%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
          style={{ zIndex: 1 }}
        ></div>

        {/* Left floating image sticking to bottom */}
        <div
          className="fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-no-repeat bg-contain bg-bottom pointer-events-none"
          style={{ zIndex: 1 }}
        ></div>

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
          {/* Gray Banner */}
          <div className="absolute w-[1240px] h-[216px] top-[0px] left-[100px] rounded-[28px] bg-[#D9D9D9] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: `url(${
                  user?.coverAvatar ? `${API}${user.coverAvatar}` : "/bgpic.jpg"
                })`,
              }}
            ></div>
          </div>

          {/* Profile Image with Gradient Border */}
          <div className="absolute top-[110px] left-[90px] w-[198px] h-[198px] rounded-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full p-[5px] bg-gradient-to-r from-[#B008A6] via-[#8C099F] to-[#540A95]">
              <div className="h-full w-full bg-white  w-[91px] h-[91px] rounded-full overflow-hidden ">
                <Image
                  src={getAvatarUrl(user?.avatarUrl)|| "/user.png"}
                  alt="Profile"
                  width={188}
                  height={188}
                  className="rounded-full object-cover"
                    unoptimized
                />
              </div>
            </div>
          </div>

          {/* User info + buttons */}
          <div className="absolute top-[230px] left-[300px] flex items-center gap-[24px]">
            <div>
              <h1 className="font-['Roboto'] font-medium text-[32px] text-[#232323] capitalize">
                {user?.username || "Alexa David"}
              </h1>
              <div className="flex items-center mt-[10px] gap-2">
                {/* <Globe size={18} className="text-[#555]" /> */}
                <Image src="/browser.svg" alt="Logo" width={18} height={16} />
                <a
                  href={user?.website || "http://www.zencorporation.com"}
                  target="_blank"
                  className="text-[#555] text-[16px] font-normal underline hover:text-[#8C099F]"
                >
                  {user?.website || "http://www.zencorporation.com"}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-70">
              <button
                onClick={() => router.push("/scan")}
                className="flex items-center justify-center bg-[#F3F3F3] rounded-[16px] hover:bg-gray-200 transition"
                style={{ width: "70px", height: "70px" }}
              >
                <Image src="/scan.svg" alt="Scan" width={32} height={32} />
              </button>

              <button
                onClick={() => router.push("/editpage")}
                className="flex items-center gap-3 bg-gradient-to-r from-[#B007A7] to-[#4F0594] text-white text-[16px] font-medium rounded-[16px] px-[24px] py-[12px] hover:opacity-90 transition"
                style={{ width: "162px", height: "48px" }}
              >
                <Edit3 size={20} />
                Edit Profile
              </button>

              <button
                onClick={() => router.push("/accountsetting")}
                className="flex items-center gap-3 bg-[#0000000D] text-[#232323] text-[16px] font-medium rounded-[16px] px-[24px] py-[12px] hover:bg-[#00000020] transition"
                style={{ width: "215px", height: "48px" }}
              >
                <Settings size={20} />
                Account Settings
              </button>
            </div>
          </div>
          {/* Divider Line */}
          <div className="absolute top-[330] left-[305px] w-[1035px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>

          {/* Left Side Details */}
          <div className="absolute top-[380] left-[100px] w-[774px] h-[505px] opacity-100">
            {/* 1️⃣ About Myself */}
            <div className="absolute top-0 left-0 w-[774px] h-[170px] rounded-[16px] bg-[#F8F8F8] border border-[#0707070A] p-4">
              <h2 className=" text-[#131313] font-['Roboto'] font-semibold text-[20px] leading-[25px] capitalize mb-3">
                About My Self
              </h2>
              <p className="text-[#555] text-[16px]">
                {user?.bio ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
              </p>
            </div>

            {/* 2️⃣ Phone Number */}
            <div className="absolute top-[186px] left-0 w-[379px] h-[108px] rounded-[16px] flex items-center gap-4 p-4 bg-[#F8F8F8] border border-[#0707070A]">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                <FaPhoneAlt size={20} />
              </div>
              <p className="text-[#131313] text-[16px] font-medium">
                {user?.phone || "+92 300 0000000"}
              </p>
            </div>

            {/* 3️⃣ Email */}
            <div className="absolute top-[186px] left-[395px] w-[379px] h-[108px] rounded-[16px] flex items-center gap-4 p-4 bg-[#F8F8F8] border border-[#0707070A]">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                <FaEnvelope size={20} />
              </div>
              <p className=" text-[#131313]  text-[16px] font-medium">
                {user?.email || "example@email.com"}
              </p>
            </div>

            {/* 4️⃣ Social Links */}
            <div className="absolute top-[310px] left-0 w-[774px] h-[195px] rounded-[16px] bg-[#F8F8F8] border border-[#0707070A] p-4">
              <h2 className=" text-[#131313]  font-['Roboto'] font-semibold text-[20px] leading-[25px] capitalize mb-3">
                Social Links
              </h2>

              <div className="flex gap-4">
                {["whatsapp", "facebook", "linkedin", "instagram"].map(
                  (key, index) => {
                    const link = user?.socialLinks?.[key] || "#";
                    return (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-[108px] h-[101px] rounded-[15px] bg-[#3434340A] hover:opacity-80 transition"
                      >
                        <Image
                          src={`/${key}.svg`}
                          alt={key}
                          width={53}
                          height={53}
                        />
                      </a>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="absolute top-[380] left-[907px] flex flex-col items-center gap-6">
            <div
              ref={qrRef}
              className="w-[433px] h-[433px] bg-[#F8F8F8] rounded-[16px] border border-[#0707070A] flex items-center justify-center"
            >
              <div className="w-[339px] h-[339px] flex items-center justify-center">
                {qrCode ? (
                  <Image
                    src={qrCode}
                    alt="QR Code"
                    width={339}
                    height={339}
                    className="rounded-lg"
                  />
                ) : (
                  <QRCodeSVG
                    value={profileUrl}
                    width={300}
                    height={300}
                    bgColor="#545454BD"
                    fgColor="#FFFFFF"
                  />
                )}
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-3 text-[#232323] text-[16px] font-medium rounded-[16px] bg-[#0000000D] hover:bg-[#00000020] transition px-[24px] py-[12px]"
                style={{ width: "207px", height: "48px" }}
              >
                <Share2 size={15} /> Share Profile URL
              </button>

              <button
                onClick={handleDownloadQr}
                className="flex items-center gap-3 text-white text-[16px] font-medium rounded-[16px] bg-gradient-to-r from-[#B007A7] to-[#4F0594] hover:opacity-90 transition px-[24px] py-[12px]"
                style={{ width: "210px", height: "48px" }}
              >
                <Image src="/scan.svg" alt="QR Icon" width={20} height={20} />
                Share QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
