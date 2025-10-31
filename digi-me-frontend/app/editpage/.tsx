"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [bannerImage, setBannerImage] = useState<string>("/bgpic.jpg");
  const [profilePreview, setProfilePreview] = useState<string>("/user.png");

  const router = useRouter();
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  // Page scaling
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

  // Fetch profile
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
        setProfilePreview(data.profileImage || data.avatarUrl || "/user.png");
        const url = `${window.location.origin}/profile/${
          data.username || "alexa"
        }`;
        setProfileUrl(url);

        // Get QR
        const qrRes = await fetch("http://localhost:5000/api/qr/generate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const qrData = await qrRes.json();
        setQrCode(qrData.qrCode);
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

  // Banner Upload
  const handleBannerClick = () => bannerInputRef.current?.click();
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setBannerImage(base64);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/profile/banner", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ banner: base64 }),
        });
        if (!res.ok) throw new Error("Upload failed");
        toast.success("Banner updated successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Error uploading banner");
      }
    };
    reader.readAsDataURL(file);
  };

  // Profile Upload
  const handleProfileClick = () => profileInputRef.current?.click();
  const handleProfileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setProfilePreview(base64);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/profile/avatar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: base64 }),
        });
        if (!res.ok) throw new Error("Upload failed");
        toast.success("Profile image updated successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Error uploading profile image");
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white relative">
        <div className="relative">
          <Image src="/group.svg" alt="Logo" width={100} height={100} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-black text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <div className="flex justify-center items-start flex-1 relative">
        {/* Floating graphics */}
        <div
          className="fixed top-0 right-0 w-[25%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
          style={{ zIndex: 1 }}
        ></div>
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
          <ToastContainer />
          <NavBar />

          {/* Gray Banner */}
          <div className="absolute w-[1240px] h-[216px] top-[118px] left-[100px] rounded-[28px] bg-[#D9D9D9] overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center transition-all duration-300"></div>
            {/* style={{ backgroundImage: `url(${bannerImage})` }} */}

            {/* Centered Vector icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/vector.svg"
                alt="Vector Icon"
                width={80}
                height={80}
                className="opacity-70"
              />
            </div>

            {/* Top-right Pencil icon */}
            <button
              onClick={handleBannerClick}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/70 hover:bg-white transition"
            >
              <Image
                src="/pencil.svg"
                alt="Edit Banner"
                width={24}
                height={24}
              />
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>

          {/* Profile Image */}
          <div className="absolute top-[252px] left-[90px] w-[198px] h-[198px] rounded-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full p-[5px] bg-gradient-to-r from-[#B008A6] via-[#8C099F] to-[#540A95]">
              <div className="h-full w-full bg-white rounded-full flex items-center justify-center relative">
                <img
                  src={profilePreview}
                  alt="Profile"
                  width={188}
                  height={188}
                  className="rounded-full object-cover opacity-10"
                />
                <Image
                  src="/pencil.svg"
                  alt="Edit Profile"
                  width={24}
                  height={24}
                  className="absolute bottom-8 right-0 z-50 cursor-pointer"
                  onClick={handleProfileClick}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={profileInputRef}
                  onChange={handleProfileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="absolute top-[375px] left-[320px] flex items-center gap-8 ">
            {/* Profile Name */}
            <div className="relative w-[420px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Profile Name
              </p>
              {/* Input */}
              <input
                type="text"
                placeholder="Enter your profile name"
                value={user?.username || ""}
                onChange={(e) =>
                  setUser((prev: any) => ({ ...prev, name: e.target.value }))
                }
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
                 px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            {/* Website URL */}
            <div className="relative w-[576px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Website URL
              </p>
              {/* Input */}
              <input
                type="text"
                placeholder="http://www.zencorporation.com"
                value={user?.website || ""}
                onChange={(e) =>
                  setUser((prev: any) => ({ ...prev, website: e.target.value }))
                }
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
             px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-[448px] left-[305px] w-[1035px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>

          <div className="absolute top-[486px] left-[110px] flex items-center gap-8 ">
            <div className="relative w-[1240px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Bio
              </p>
              {/* Input */}
              <textarea
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                className="mt-2 w-[1240px] h-[88px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
               px-4 py-1 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E]
               placeholder:text-gray-400 focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <div className="absolute top-[605px] left-[110px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>

          <div className="absolute top-[650px] left-[110px] flex items-center gap-8 ">
            <div className="relative w-[600px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">
                Phone Number
              </p>

              {/* Input */}
              <input
                type="text"
                placeholder="+1 234 567 8901"
                value={user?.phone || ""}
                onChange={(e) =>
                  setUser((prev: any) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
      px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none
      flex items-center"
              />
            </div>

            
            <div className="relative w-[600px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Email Address
              </p>
              {/* Input */}
              <input
                type="text"
                placeholder="Alexadavid@email.com"
                value={user?.email || ""}
                onChange={(e) =>
                  setUser((prev: any) => ({ ...prev, email: e.target.value }))
                }
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
             px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

           <div className="absolute top-[735px] left-[110px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>

           <div>
             <div className="absolute top-[775px] left-[110px] flex items-center gap-8 ">
            {/* Profile Name */}
            <div className="relative w-[600px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Social link 1
              </p>
              {/* Input */}
              <input
                type="text"
                placeholder="Enter your profile name"
                value={user?.username || ""}
                onChange={(e) =>
                  setUser((prev: any) => ({ ...prev, name: e.target.value }))
                }
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
                 px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            {/* Website URL */}
            <div className="relative w-[600px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Social link 2
              </p>
              {/* Input */}
              <input
                type="text"
                placeholder="http://www.zencorporation.com"
                value={user?.website || ""}
                onChange={(e) =>
                  setUser((prev: any) => ({ ...prev, website: e.target.value }))
                }
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
             px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="absolute top-[870px] left-[110px] flex items-center gap-8 ">
            {/* Profile Name */}
            <div className="relative w-[600px]">
              {/* Label */}
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Social link 3
              </p>
              {/* Input */}
              <input
                type="text"
                placeholder="Enter your profile name"
                value={user?.username || ""}
                onChange={(e) =>
                  setUser((prev: any) => ({ ...prev, name: e.target.value }))
                }
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px]
                 px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
              />
            </div>

          </div>
           </div>
         

           <div className="absolute top-[935px] left-[110px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>
 {/* Bottom-right buttons container */}
<div className="fixed bottom-6 right-6 flex gap-4 z-50">
  <button
     // or custom cancel logic
    className="flex items-center gap-3 text-[#232323] text-[16px] font-medium rounded-[16px] bg-[#0000000D] hover:bg-[#00000020] transition px-6 py-3"
  >
    Cancel
  </button>

  <button
   // see below for function
    className="flex items-center gap-3 text-white text-[16px] font-medium rounded-[16px] bg-gradient-to-r from-[#B007A7] to-[#4F0594] hover:opacity-90 transition px-6 py-3"
  >
    Update Profile
  </button>
</div>

       

        </div>
      </div>

      <Footer />
    </div>
  );
}
