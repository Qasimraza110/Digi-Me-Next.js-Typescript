"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Edit3, Settings, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import NavBar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);
  const API = "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setUser(data);
        const url = `${window.location.origin}/profile/${data.username || "alexa"}`;
        setProfileUrl(url);

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

  const handleDownloadQr = async () => {
    try {
      if (qrCode) {
        const link = document.createElement("a");
        link.href = qrCode;
        link.download = `${user?.username || "profile"}-qr.png`;
        link.click();
        toast.success("QR Code downloaded!", { position: "top-right" });
      } else if (qrRef.current) {
        const svg = qrRef.current.querySelector("svg");
        if (svg) {
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
            link.download = `${user?.username || "profile"}-qr.png`;
            link.click();
            toast.success("QR Code downloaded!", { position: "top-right" });
          };
          img.src = url;
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to download QR Code", { position: "top-right" });
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile URL copied!", { position: "top-right" });
    } catch {
      toast.error("❌ Failed to copy URL.", { position: "top-right" });
    }
  };

  const getAvatarUrl = (url?: string) => {
    if (!url) return "/userpic.jpg";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${API}${url}`;
    return "/userpic.jpg";
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-white relative">
        <Image src="/group.svg" alt="Logo" width={100} height={100} />
        <div className="absolute top-1/2 left-1/2 w-[120px] h-[120px] border-4 border-t-pink-500 border-gray-300 rounded-full animate-spin -translate-x-1/2 -translate-y-1/2"></div>
        <p className="mt-6 text-white text-lg">Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToastContainer />
      <NavBar />

      <div className="relative flex-1 overflow-auto px-4 sm:px-6 md:px-16 lg:px-[75px]">
        {/* Desktop floating images */}
        <div className="hidden lg:block fixed top-0 right-0 w-[20%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none z-10"></div>
        <div className="hidden lg:block fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-no-repeat bg-contain bg-bottom pointer-events-none z-10"></div>

        <div className="relative max-w-[1440px] mx-auto">
          {/* Cover Banner */}
          <div className="w-full lg:w-[1240px] h-52 lg:h-[216px] rounded-2xl bg-[#D9D9D9] overflow-hidden relative mx-auto">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: `url(${user?.coverAvatar ? API + user.coverAvatar : "/bgpic.jpg"})`,
              }}
            ></div>
          </div>

          {/* Profile Avatar */}
          <div className="w-40 h-40 lg:w-[198px] lg:h-[198px] rounded-full p-[5px] bg-gradient-to-r from-[#B008A6] via-[#8C099F] to-[#540A95] relative -mt-20 lg:-mt-32 mx-auto lg:mx-0">
            <div className="w-full h-full bg-white rounded-full overflow-hidden">
              <Image
                src={getAvatarUrl(user?.avatarUrl)}
                alt="Profile"
                width={188}
                height={188}
                className="rounded-full object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Username + Website + Buttons */}
          <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:gap-4 text-center lg:text-left">
            <div>
              <h1 className="text-2xl lg:text-3xl font-medium text-[#232323] capitalize">
                {user?.username || "Alexa David"}
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                <Image src="/browser.svg" alt="Logo" width={18} height={16} />
                <a
                  href={user?.website || "http://www.zencorporation.com"}
                  target="_blank"
                  className="text-[#555] text-[14px] lg:text-[16px] underline hover:text-[#8C099F]"
                >
                  {user?.website || "http://www.zencorporation.com"}
                </a>
              </div>
            </div>

            <div className="flex gap-2 lg:gap-4 mt-2 lg:mt-0 justify-center lg:justify-start flex-wrap">
              <button
                onClick={() => router.push("/scan")}
                className="w-16 h-16 bg-[#F3F3F3] rounded-lg flex items-center justify-center hover:bg-gray-200"
              >
                <Image src="/scan.svg" alt="Scan" width={32} height={32} />
              </button>
              <button
                onClick={() => router.push("/editpage")}
                className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#B007A7] to-[#4F0594] rounded-lg hover:opacity-90"
              >
                <Edit3 size={20} />
                Edit
              </button>
              <button
                onClick={() => router.push("/accountsetting")}
                className="flex items-center gap-2 px-4 py-2 text-[#232323] bg-[#0000000D] rounded-lg hover:bg-[#00000020]"
              >
                <Settings size={20} />
                Account
              </button>
            </div>
          </div>

          {/* Desktop Absolute Layout Sections */}
          <div className="hidden lg:block">
            {/* About / Phone / Email / Social */}
            <div className="absolute top-[380px] left-[100px] w-[774px] h-[505px] space-y-4">
              <div className="bg-[#F8F8F8] p-4 rounded-[16px] border border-[#0707070A]">
                <h2 className="text-[20px] font-semibold text-[#131313] mb-2">About Myself</h2>
                <p className="text-[16px] text-[#555]">{user?.bio || "Lorem ipsum..."}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-[#F8F8F8] p-4 rounded-[16px] border flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                    <FaPhoneAlt size={20} />
                  </div>
                  <p className="text-[#131313] font-medium">{user?.phone || "+92 300 0000000"}</p>
                </div>
                <div className="flex-1 bg-[#F8F8F8] p-4 rounded-[16px] border flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                    <FaEnvelope size={20} />
                  </div>
                  <p className="text-[#131313] font-medium">{user?.email || "example@email.com"}</p>
                </div>
              </div>
              <div className="bg-[#F8F8F8] p-4 rounded-[16px] border">
                <h2 className="text-[20px] font-semibold text-[#131313] mb-2">Social Links</h2>
                <div className="flex gap-4">
                  {["whatsapp","facebook","linkedin","instagram"].map((key,i)=>(
                    <a key={i} href={user?.socialLinks?.[key]||"#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-[108px] h-[101px] rounded-[15px] bg-[#3434340A] hover:opacity-80 transition">
                      <Image src={`/${key}.svg`} alt={key} width={53} height={53}/>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="absolute top-[380px] left-[907px] flex flex-col items-center gap-6">
              <div ref={qrRef} className="w-[433px] h-[433px] bg-[#F8F8F8] rounded-[16px] border flex items-center justify-center">
                {qrCode ? <Image src={qrCode} alt="QR" width={339} height={339} className="rounded-lg"/> : <QRCodeSVG value={profileUrl} width={300} height={300} fgColor="#FFFFFF" bgColor="#545454BD"/>}
              </div>
              <div className="flex gap-4">
                <button onClick={handleCopyUrl} className="flex items-center gap-3 text-[#232323] text-[16px] font-medium rounded-[16px] bg-[#0000000D] hover:bg-[#00000020] px-6 py-3">
                  <Share2 size={15}/> Share Profile URL
                </button>
                <button onClick={handleDownloadQr} className="flex items-center gap-3 text-white text-[16px] font-medium rounded-[16px] bg-gradient-to-r from-[#B007A7] to-[#4F0594] px-6 py-3">
                  <Image src="/scan.svg" alt="QR Icon" width={20} height={20}/> Share QR Code
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Sections */}
          <div className="lg:hidden flex flex-col gap-4 mt-6">
            {/* About */}
            <div className="bg-[#F8F8F8] p-4 rounded-lg border border-[#0707070A]">
              <h2 className="text-lg font-semibold text-[#131313] mb-2">About Myself</h2>
              <p className="text-[#555] text-sm">{user?.bio || "Lorem ipsum..."}</p>
            </div>
            {/* Contact */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-[#F8F8F8] p-4 rounded-lg border flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                  <FaPhoneAlt size={20}/>
                </div>
                <p className="text-[#131313] font-medium">{user?.phone || "+92 300 0000000"}</p>
              </div>
              <div className="flex-1 bg-[#F8F8F8] p-4 rounded-lg border flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#B007A7] via-[#4F0594] to-[#8C099F] text-white">
                  <FaEnvelope size={20}/>
                </div>
                <p className="text-[#131313] font-medium">{user?.email || "example@email.com"}</p>
              </div>
            </div>
            {/* Social Links */}
            <div className="bg-[#F8F8F8] p-4 rounded-lg border border-[#0707070A]">
              <h2 className="text-lg font-semibold text-[#131313] mb-2">Social Links</h2>
              <div className="flex flex-wrap gap-4">
                {["whatsapp","facebook","linkedin","instagram"].map((key,i)=>(
                  <a key={i} href={user?.socialLinks?.[key]||"#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-24 h-24 rounded-lg bg-[#3434340A] hover:opacity-80">
                    <Image src={`/${key}.svg`} alt={key} width={53} height={53}/>
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile QR Code */}
            <div className="flex flex-col items-center gap-4">
              <div ref={qrRef} className="w-80 h-80 bg-[#F8F8F8] rounded-lg border flex items-center justify-center">
                {qrCode ? <Image src={qrCode} alt="QR" width={339} height={339} className="rounded-lg"/> : <QRCodeSVG value={profileUrl} width={300} height={300} fgColor="#FFFFFF" bgColor="#545454BD"/>}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={handleCopyUrl} className="flex items-center gap-2 px-4 py-2 bg-[#0000000D] rounded-lg text-sm sm:text-base hover:bg-[#00000020]">
                  <Share2 size={15}/> Share Profile URL
                </button>
                <button onClick={handleDownloadQr} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B007A7] to-[#4F0594] rounded-lg text-white text-sm sm:text-base">
                  <Image src="/scan.svg" alt="QR Icon" width={20} height={20}/> Share QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
