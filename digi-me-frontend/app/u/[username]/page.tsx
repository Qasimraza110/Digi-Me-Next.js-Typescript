"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bookmark, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import NavBar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function PublicProfile() {
  const params = useParams();
  const usernameParam = params?.username as string | undefined;
  const decodedUsername = usernameParam ? decodeURIComponent(usernameParam) : null;

  const searchParams = useSearchParams();
  const router = useRouter();
  const API = "http://localhost:5000";

  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  const cameFromQR = searchParams.get("qr") === "1";

  // -------------------------------
  // Fetch public profile
  // -------------------------------
  useEffect(() => {
    if (!decodedUsername) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/users/${decodedUsername}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfile(data.user || data);
        setProfileUrl(`${window.location.origin}/u/${decodedUsername}`);
      } catch (err) {
        console.error(err);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [decodedUsername]);

  // -------------------------------
  // Fetch logged-in user
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (!cameFromQR) setShowLoginPopup(true);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        if (!cameFromQR) setShowLoginPopup(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [cameFromQR]);

  // -------------------------------
  // Handle scaling for desktop
  // -------------------------------
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

  const handleLogin = () =>
    router.push(`/login?redirect=/u/${encodeURIComponent(decodedUsername || "")}`);
  const handleSignup = () =>
    router.push(`/register?redirect=/u/${encodeURIComponent(decodedUsername || "")}`);

  const getAvatarUrl = (url?: string): string => {
    if (!url) return "/userpic.jpg";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${API}${url}`;
    return "/userpic.jpg";
  };

  const handleSaveProfile = async (targetUserId: string) => {
    if (!user) {
      toast.error("Please log in to save profiles!");
      return;
    }
    try {
      const res = await fetch(`${API}/api/saved`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.includes("already saved")) {
          toast.info("⚡ Profile already saved!", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
        } else {
          throw new Error(data.message || "Failed to save profile");
        }
        return;
      }

      toast.success("Profile saved successfully!", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong!");
    }
  };

  const handleDownloadQr = () => {
    try {
      if (qrRef.current) {
        const svg = qrRef.current.querySelector("svg");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const img = document.createElement("img");
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
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
          link.download = `${profile?.username || "profile"}-qr.png`;
          link.click();
          toast.success("QR Code downloaded!", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
        };
        img.src = url;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to download QR Code", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile URL copied!", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
    } catch {
      toast.error("Failed to copy URL.", {
          position: "top-right",
          style: {
            background: "linear-gradient(to right, #9333EA, #EC4899)",
            color: "#fff",
          },
        });
    }
  };

  // -------------------------------
  // Loading & error states
  // -------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white relative">
        <div className="relative">
          <Image src="/group.svg" alt="Logo" width={100} height={100} loading="eager" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-black text-lg">Loading profile...</p>
      </div>
    );
  }

  // if (!profile) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <h1 className="text-2xl font-bold">Profile not found</h1>
  //     </div>
  //   );
  // }
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToastContainer />
      <NavBar />
        {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center gap-4 w-[400px] max-w-[90%]">
            <h2 className="text-xl text-black font-semibold">Login Required</h2>
            <p className="text-gray-600 text-center">
              To access full features, please login first.
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-md hover:opacity-90 transition"
            >
              Login Now
            </button>
            <button
              onClick={handleSignup}
              className="w-full mt-2 underline text-gray-600"
            >
              Signup
            </button>
          </div>
        </div>
      )}

      {/* Right floating image   `relative flex-1 flex justify-center items-start overflow-auto px-4 `*/}
      <div className={`${showLoginPopup ? "filter blur-sm pointer-events-none" : ""} relative flex-1 flex justify-center items-start overflow-auto px-4 `}>  
      {/* Right floating image */}
      {/* <div className="relative flex-1 flex justify-center items-start overflow-auto px-4 "> */}
        <div
          className="fixed top-0 right-0 w-[25%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
          style={{ zIndex: 1 }}
        />
        {/* Left floating image */}
        <div
          className="fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-no-repeat bg-contain bg-bottom pointer-events-none"
          style={{ zIndex: 1 }}
        />

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
                  profile?.coverAvatar
                    ? `${API}${profile.coverAvatar}`
                    : "/bgpic.jpg"
                })`,
              }}
            ></div>
          </div>

          {/* Profile Image */}
          <div className="absolute top-[110px] left-[90px] w-[198px] h-[198px] rounded-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full p-[5px] bg-gradient-to-r from-[#B008A6] via-[#8C099F] to-[#540A95]">
              <div className="h-full w-full bg-white w-[91px] h-[91px] rounded-full overflow-hidden ">
                <Image
                  src={getAvatarUrl(profile?.avatarUrl)}
                  alt={profile?.username || "Profile"}
                  width={188}
                  height={188}
                  className="rounded-full object-cover"
                    unoptimized

                />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="absolute top-[230px] left-[305px] flex items-center gap-[24px]">
            <div>
              <h1 className="font-['Roboto'] font-medium text-[32px] text-[#232323] capitalize">
                {profile?.username || "Anonymous"}
              </h1>
              <div className="flex items-center mt-[10px] gap-2">
                {/* <Globe size={18} className="text-[#555]" /> */}
                <Image src="/browser.svg" alt="Logo" width={18} height={16} />
                <a
                  href={profile?.website || "#"}
                  target="_blank"
                  className="text-[#555] text-[16px] font-normal underline hover:text-[#8C099F]"
                >
                  {profile?.website || "#"}
                </a>
              </div>
            </div>
            {/* Save Profile Button */}
            <div className="flex items-center gap-4 ml-155">
              {user?._id !== profile?._id && (
                <button
                  onClick={() => handleSaveProfile(profile?._id)}
                  className="flex items-center gap-3 bg-gradient-to-r from-[#B306A7] to-[#4C0593] text-white text-[16px] font-medium rounded-[16px] px-[24px] py-[12px] hover:opacity-90 transition"
                >
                  <Bookmark size={20} />
                  Save Profile
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-[330px] left-[305px] w-[1035px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>

          {/* Left Details */}
          <div className="absolute top-[380px] left-[100px] w-[774px] h-[505px] opacity-100">
            {/* About Myself */}
            <div className="absolute top-0 left-0 w-[774px] h-[170px] rounded-[16px] bg-[#F8F8F8] border border-[#0707070A] p-4">
              <h2 className="text-[#131313] font-['Roboto'] font-semibold text-[20px] leading-[25px] capitalize mb-3">
                About My Self
              </h2>
              <p className="text-[#555] text-[16px]">
                {profile?.bio || "Lorem ipsum dolor sit amet."}
              </p>
            </div>

            {/* Phone */}
            <div className="absolute top-[186px] left-0 w-[379px] h-[108px] rounded-[16px] flex items-center gap-4 p-4 bg-[#F8F8F8] border border-[#0707070A]">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                <FaPhoneAlt size={20} />
              </div>
              <p className="text-[#131313] text-[16px] font-medium">
                {profile?.phone || "+92 300 0000000"}
              </p>
            </div>

            {/* Email */}
            <div className="absolute top-[186px] left-[395px] w-[379px] h-[108px] rounded-[16px] flex items-center gap-4 p-4 bg-[#F8F8F8] border border-[#0707070A]">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                <FaEnvelope size={20} />
              </div>
              <p className="text-[#131313] text-[16px] font-medium">
                {profile?.email || "example@email.com"}
              </p>
            </div>

            {/* Social Links */}
            <div className="absolute top-[310px] left-0 w-[774px] h-[195px] rounded-[16px] bg-[#F8F8F8] border border-[#0707070A] p-4">
              <h2 className="text-[#131313] font-['Roboto'] font-semibold text-[20px] leading-[25px] capitalize mb-3">
                Social Links
              </h2>
              <div className="flex gap-4">
                {["whatsapp", "facebook", "linkedin", "instagram"].map(
                  (key, index) => {
                    const link = profile?.socialLinks?.[key] || "#";
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
          <div className="absolute top-[380px] left-[907px] flex flex-col items-center gap-6">
            <div
              ref={qrRef}
              className="w-[433px] h-[433px] bg-[#F8F8F8] rounded-[16px] border border-[#0707070A] flex items-center justify-center"
            >
              <div className="w-[339px] h-[339px] flex items-center justify-center">
                <QRCodeSVG
                  value={profileUrl}
                  width={300}
                  height={300}
                  bgColor="#545454BD"
                  fgColor="#FFFFFF"
                />
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
                <Image src="/scan.svg" alt="QR Icon" width={20} height={20} />{" "}
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
