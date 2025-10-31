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
  const [bannerImage, setBannerImage] = useState<string>("/bgpic.jpg");
  const [profilePreview, setProfilePreview] = useState<string>("/user.png");

  const router = useRouter();
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const platforms = ["Facebook", "Instagram", "LinkedIn", "WhatsApp"];


  const [socialLinks, setSocialLinks] = useState([
  { name: "social1", url: "" },
  { name: "social2", url: "" },
  { name: "social3", url: "" },
 { name: "social4", url: "" },
]);
const [showAddButton, setShowAddButton] = useState(true);


  const API = "http://localhost:5000";

  const handleBannerClick = () => bannerInputRef.current?.click();
  const handleProfileClick = () => profileInputRef.current?.click();

  // Resize scaling
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

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setUser(data);

      // Load avatar and cover if available
      if (data.avatarUrl) setProfilePreview(`${API}${data.avatarUrl}`);
      if (data.coverAvatar) setBannerImage(`${API}${data.coverAvatar}`);

      // Convert socialLinks object to array for inputs
      const linksObj = data.socialLinks || {};
      const linksArray = [
        { name: "facebook", url: linksObj.facebook || "" },
        { name: "instagram", url: linksObj.instagram || "" },
        { name: "linkedin", url: linksObj.linkedin || "" },
        { name: "whatsapp", url: linksObj.whatsapp || "" },
      ];
      setSocialLinks(linksArray);
    } catch (err) {
      console.error("Profile load error:", err);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  loadProfile();
}, [router]);




  // Upload Banner
  const handleBannerChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerImage(URL.createObjectURL(file));
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("coverAvatar", file);

    try {
      const res = await fetch(`${API}/api/profile/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();

      if (updated.coverAvatar) setBannerImage(`${API}${updated.coverAvatar}`);
      toast.success("Banner updated");
    } catch {
      toast.error("Banner upload failed");
    }
  };

  // Upload Profile Image
  const handleProfileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePreview(URL.createObjectURL(file));
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${API}/api/profile/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();

      if (updated.avatarUrl) setProfilePreview(`${API}${updated.avatarUrl}`);
     toast.success("Profile photo updated!", {
  style: {
    background: "linear-gradient(to right, #B306A7, #4C0593)",
    color: "#fff",
    fontWeight: "bold",
  },
});

    } catch (err) {
      console.error(err);
      toast.error("Profile upload failed", {
  style: {
    background: "linear-gradient(to right, #FF4E50, #F9D423)",
    color: "#fff",
    fontWeight: "bold",
  },
});
    }
  };

  // Update text fields
const handleUpdateProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const formData = new FormData();

    // Normal profile fields
    formData.append("username", user.username || "");
    formData.append("website", user.website || "");
    formData.append("phone", user.phone || "");
    formData.append("email", user.email || "");
    formData.append("bio", user.bio || "");

    // Social links: always send as array of objects
    formData.append("socialLinks", JSON.stringify(socialLinks));

    // Optional files (avatar & cover)
    if (profileInputRef.current?.files?.[0]) {
      formData.append("avatar", profileInputRef.current.files[0]);
    }
    if (bannerInputRef.current?.files?.[0]) {
      formData.append("coverAvatar", bannerInputRef.current.files[0]);
    }

    const res = await fetch(`${API}/api/profile/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to update profile");

    const updated = await res.json();
    setUser(updated);

    if (updated.avatarUrl) setProfilePreview(`${API}${updated.avatarUrl}`);
    if (updated.coverAvatar) setBannerImage(`${API}${updated.coverAvatar}`);

    toast.success("Profile updated!", {
      style: {
        background: "linear-gradient(to right, #B306A7, #4C0593)",
        color: "#fff",
        fontWeight: "bold",
      },
    });
  } catch (err) {
    console.error(err);
    toast.error("Error updating profile", {
      style: {
        background: "linear-gradient(to right, #FF4E50, #F9D423)",
        color: "#fff",
        fontWeight: "bold",
      },
    });
  }
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

          <div className="absolute w-[1240px] h-[216px] top-[118px] left-[100px] rounded-[28px] bg-[#D9D9D9] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover  bg-center transition-all duration-300  bg-[url('/profilebanner.png')]"
              // style={{ backgroundImage: `url(${bannerImage})` }}
            ></div>
            {/* Default icon if no banner */}
            {!bannerImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/vector.svg"
                  alt="Vector"
                  width={80}
                  height={80}
                  className="opacity-70"
                />
              </div>
            )}

            {/* Pencil Button */}
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

            {/* Hidden File Input */}
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
              <div className="h-full w-full bg-white  w-[91px] h-[91px] rounded-full overflow-hidden ">
                <img
                  src={profilePreview}
                  alt="Profile"
                  width={188}
                  height={188}
                  className="rounded-full object-cover"
                />

                {/* Edit Icon */}
                <Image
                  src="/pencil.svg"
                  alt="Edit Profile"
                  width={24}
                  height={24}
                  className="absolute bottom-8 right-0 z-50 cursor-pointer"
                  onClick={handleProfileClick}
                />

                {/* Hidden input */}
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
                  setUser((prev: any) => ({
                    ...prev,
                    username: e.target.value,
                  }))
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
                value={user.bio || ""} // ✅ show current bio
                onChange={(e) => setUser({ ...user, bio: e.target.value })} // ✅ update state
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
            <div className="absolute top-[730px] left-[110px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>
             
<div>
  {/* Row 1: Social link 1 & 2 */}
  <div className="absolute top-[775px] left-[110px] flex items-center gap-8">
    {socialLinks.slice(0, 2).map((link, idx) => (
      <div key={idx} className="relative w-[600px]">
        <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">
          Social link {idx + 1}
        </p>
        <input
          type="text"
          placeholder={`Enter ${platforms[idx]} link`}
          value={link.url}
          onChange={(e) => {
            const updated = [...socialLinks];
            updated[idx].url = e.target.value;
            setSocialLinks(updated);
          }}
          className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
        />
      </div>
    ))}
  </div>

  {/* Row 2: Social link 3 + optional Social link 4 + Plus button */}
<div className="absolute top-[870px] left-[110px] flex items-center gap-8">
  {/* Social link 3 */}
  <div className="relative w-[600px]">
    <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">
      Social link 3
    </p>
    <input
      type="text"
      placeholder="Enter Linkedin link "
      value={socialLinks[2].url}
      onChange={(e) => {
        const updated = [...socialLinks];
        updated[2].url = e.target.value;
        setSocialLinks(updated);
      }}
      className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
    />
  </div>

  {/* Conditional: show + button if 4th link not yet added */}
{/* + Button: show only if less than 4 links */}
{socialLinks.length < 4 && (
  <button
    onClick={() =>
      setSocialLinks([
        ...socialLinks,
        { name: `social${socialLinks.length + 1}`, url: "" },
      ])
    }
    className="w-[48px] h-[48px] bg-gradient-to-r from-[#B306A7] to-[#4C0593] text-white text-2xl font-bold rounded-lg hover:scale-105 transition"
  >
    +
  </button>
)}

{/* Social link 4: render only if exists */}
{socialLinks[3] && (
  <div className="relative w-[600px]">
    <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">
      Social link 4
    </p>
    <input
      type="text"
      placeholder="Enter WhatsApp link"
      value={socialLinks[3].url}
      onChange={(e) => {
        const updated = [...socialLinks];
        updated[3].url = e.target.value;
        setSocialLinks(updated);
      }}
      className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
    />
  </div>
)}

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
              onClick={handleUpdateProfile}
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
