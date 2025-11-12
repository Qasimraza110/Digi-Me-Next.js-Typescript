"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateUsername,
  validateEmail,
  validatePhone,
  validateBio,
  validateSocialLink,
} from "@/utils/validation";

export default function ProfilePage() {
  const router = useRouter();
  const API = "http://localhost:5000";

  // --- states ---
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerImage, setBannerImage] = useState<string>("/bgpic.jpg");
  const [profilePreview, setProfilePreview] = useState<string>("/user.png");
  const [hasBannerError, setHasBannerError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  const platforms = ["Facebook", "Instagram", "LinkedIn", "WhatsApp"];
  const [socialLinks, setSocialLinks] = useState([
    { name: "facebook", url: "" },
    { name: "instagram", url: "" },
    { name: "linkedin", url: "" },
    { name: "whatsapp", url: "" },
  ]);

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    phone: false,
    bio: false,
  });
  const [socialErrors, setSocialErrors] = useState<boolean[]>([false, false, false, false]);

  const toastStyle = {
    style: {
      background: "linear-gradient(to right, #B306A7, #4C0593)",
      color: "#fff",
      fontWeight: "bold",
    },
  };

  // --- scale effect ---
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

  // --- load profile ---
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

        if (data.avatarUrl) setProfilePreview(`${API}${data.avatarUrl}`);
        if (data.coverAvatar) setBannerImage(`${API}${data.coverAvatar}`);

        const linksObj = data.socialLinks || {};
        setSocialLinks([
          { name: "facebook", url: linksObj.facebook || "" },
          { name: "instagram", url: linksObj.instagram || "" },
          { name: "linkedin", url: linksObj.linkedin || "" },
          { name: "whatsapp", url: linksObj.whatsapp || "" },
        ]);
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

  // --- banner upload ---
  const handleBannerClick = () => bannerInputRef.current?.click();
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        if (img.width !== 2480 || img.height !== 432) {
          toast.error(
            `Banner must be exactly 2480x432px. Your image is ${img.width}x${img.height}px.`,
            toastStyle
          );
          setBannerImage("/bgpic.jpg");
          setHasBannerError(true);
          return;
        }

        setHasBannerError(false);
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
          if (!res.ok) throw new Error("Upload failed");
          const updated = await res.json();
          if (updated.coverAvatar) setBannerImage(`${API}${updated.coverAvatar}`);
          toast.success("Banner updated!", toastStyle);
        } catch (err) {
          console.error(err);
          toast.error("Banner upload failed", toastStyle);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // --- profile upload ---
  const handleProfileClick = () => profileInputRef.current?.click();
  const handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!res.ok) throw new Error("Upload failed");
      const updated = await res.json();
      if (updated.avatarUrl) setProfilePreview(`${API}${updated.avatarUrl}`);
      toast.success("Profile photo updated!", toastStyle);
    } catch (err) {
      console.error(err);
      toast.error("Profile upload failed", toastStyle);
    }
  };

  // --- input change ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (name === "socialLink" && typeof index === "number") {
      setSocialLinks((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], url: value };
        return updated;
      });

      setSocialErrors((prev) => {
        const updated = [...prev];
        updated[index] = !validateSocialLink(value).isValid;
        return updated;
      });
      return;
    }

    setUser((prev: any) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (name === "username") newErrors.username = !validateUsername(value).isValid;
      if (name === "email") newErrors.email = !validateEmail(value).isValid;
      if (name === "phone") newErrors.phone = !validatePhone(value).isValid;
      if (name === "bio") newErrors.bio = !validateBio(value).isValid;
      return newErrors;
    });
  };

  const handleAddSocialLink = () => {
    if (socialLinks.length >= 4) return;
    setSocialLinks((prev) => [...prev, { name: `social${prev.length + 1}`, url: "" }]);
    setSocialErrors((prev) => [...prev, false]);
  };

  // --- update profile ---
  const handleUpdateProfile = async () => {
    if (hasBannerError) {
      toast.error("Cannot update profile: banner dimensions are incorrect.", {
        style: {
          background: "linear-gradient(to right, #FF4E50, #F9D423)",
          color: "#fff",
          fontWeight: "bold",
        },
      });
      return;
    }

    const usernameValid = validateUsername(user?.username || "");
    const emailValid = validateEmail(user?.email || "");
    const phoneValid = validatePhone(user?.phone || "");
    const bioValid = validateBio(user?.bio || "");

    const newErrors = {
      username: !usernameValid.isValid,
      email: !emailValid.isValid,
      phone: !phoneValid.isValid,
      bio: !bioValid.isValid,
    };
    setErrors(newErrors);

    const socialValidationResults = socialLinks.map((s) => validateSocialLink(s.url));
    const anySocialInvalid = socialValidationResults.some((r) => !r.isValid);
    if (anySocialInvalid) {
      const updatedSocialErrors = socialValidationResults.map((r) => !r.isValid);
      setSocialErrors(updatedSocialErrors);
      const firstInvalid = socialValidationResults.find((r) => !r.isValid);
      toast.error(firstInvalid?.message || "Invalid social link", {
        style: {
          background: "linear-gradient(to right, #FF4E50, #F9D423)",
          color: "#fff",
          fontWeight: "bold",
        },
      });
      return;
    }

    if (Object.values(newErrors).some(Boolean)) {
      setIsButtonDisabled(true);
      setTimeout(() => setIsButtonDisabled(false), 2000);
      return;
    }

    try {
      setIsUpdating(true);

      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const formData = new FormData();
      const payload = { username: user.username, email: user.email, phone: user.phone, bio: user.bio, website: user.website, socialLinks };
      formData.append("json", JSON.stringify(payload));

      if (profileInputRef.current?.files?.[0]) formData.append("avatar", profileInputRef.current.files[0]);
      if (bannerInputRef.current?.files?.[0] && !hasBannerError) formData.append("coverAvatar", bannerInputRef.current.files[0]);

      const res = await fetch(`${API}/api/profile/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Failed to update profile");
      }

      const updated = await res.json();
      setUser(updated);
      if (updated.avatarUrl) setProfilePreview(`${API}${updated.avatarUrl}`);
      if (updated.coverAvatar) setBannerImage(`${API}${updated.coverAvatar}`);

      toast.success("Profile updated!", toastStyle);

      setTimeout(() => {
        setIsUpdating(false);
        router.replace("/profile");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile", {
        style: {
          background: "linear-gradient(to right, #FF4E50, #F9D423)",
          color: "#fff",
          fontWeight: "bold",
        },
      });
      setIsUpdating(false);
    }
  };


  // ---------- end of setup, now render ----------
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
    <div className="min-h-screen bg-white flex flex-col">
      <ToastContainer />
      <NavBar />
      <div className="relative flex-1 flex justify-center items-start overflow-auto px-4 ">
        {/* Floating graphics (kept as-is) */}
        <div
          className="fixed top-0 right-0 w-[25%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
          style={{ zIndex: 1 }}
        />
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
          {/* Banner */}
          <div className="absolute w-[1240px] h-[216px] top-[0px] left-[100px] rounded-[28px] bg-[#D9D9D9] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300 bg-[url('/profilebanner.png')]"
              style={{ backgroundImage: `url(${bannerImage})` }}
            />
            {!bannerImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image src="/vector.svg" alt="Vector" width={80} height={80} className="opacity-70" />
              </div>
            )}
            <button onClick={handleBannerClick} className="absolute top-4 right-4 p-2 rounded-full bg-white/70 hover:bg-white transition">
              <Image src="/pencil.svg" alt="Edit Banner" width={24} height={24} />
            </button>
            <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleBannerChange} className="hidden" />
          </div>

          {/* Profile image */}
          <div className="absolute top-[110px] left-[90px] w-[198px] h-[198px] rounded-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full p-[5px] bg-gradient-to-r from-[#B008A6] via-[#8C099F] to-[#540A95]">
              <div className="h-full w-full bg-white w-[91px] h-[91px] rounded-full overflow-hidden">
                <img src={profilePreview|| "/user.png"} alt="Profile" width={188} height={188} className="rounded-full object-cover" />
                <Image
                  src="/pencil.svg"
                  alt="Edit Profile"
                  width={24}
                  height={24}
                  className="absolute bottom-10 right-0 z-50 cursor-pointer"
                  onClick={handleProfileClick}
                />
                <input type="file" accept="image/*" ref={profileInputRef} onChange={handleProfileChange} className="hidden" />
              </div>
            </div>
          </div>

          {/* Profile name + website */}
          <div className="absolute top-[250px] left-[320px] flex items-center gap-8 ">
            <div className="relative w-[420px]">
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Profile Name
              </p>
              <input
                name="username"
                type="text"
                placeholder="Enter your profile name"
                value={user?.username || ""}
                onChange={handleInputChange}
                className={`w-full h-[48px] bg-[#F8F8F8] px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none rounded-[16px] border ${
                  errors.username ? "border-red-500" : "border-[#EEEEEE]"
                }`}
              />
              {errors.username && <p className="text-red-500 text-sm font-medium ml-2">Username can only contain letters, numbers, and underscores</p>}
            </div>

            <div className="relative w-[576px]">
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Website URL
              </p>
              <input
                name="website"
                type="text"
                placeholder="http://www.zencorporation.com"
                value={user?.website || ""}
                onChange={handleInputChange}
                className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px] px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-[330px] left-[305px] w-[1035px] h-[1px] bg-[#E2E2E2] rounded-[18px]" />

          {/* Bio */}
       <div className="absolute top-[360px] left-[110px] flex items-center gap-8 ">
  <div className="relative w-[1240px]">
    <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
      Bio
    </p>
    <textarea
      name="bio"
      value={user?.bio || ""}
      onChange={handleInputChange}
      placeholder="Lorem ipsum dolor sit amet..."
      maxLength={400} // limit characters
      className={`mt-2 w-[1240px] h-[88px] bg-[#F8F8F8] rounded-[16px] px-4 py-1 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none resize-none border ${
        errors.bio ? "border-red-500" : "border-[#EEEEEE]"
      }`}
    />
    {/* Error message */}
    {errors.bio && (
      <p className="text-red-500 text-sm font-medium absolute top-full left-0 mt-1">
        Bio is invalid, no more than 400 words
      </p>
    )}
    {/* Character counter */}
    <span className="absolute bottom-3 right-4 text-gray-500 text-sm">
      {user?.bio?.length || 0}/400
    </span>
  </div>
</div>


          {/* Divider */}
          <div className="absolute top-[480px] left-[110px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]" />

          {/* Phone + Email */}
          <div className="absolute top-[530px] left-[110px] flex items-center gap-8 ">
            <div className="relative w-[600px]">
              <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">Phone Number</p>
             <input
  name="phone"
  type="text"
  placeholder="+1 234 567 8901"
  value={user?.phone || ""}
  onChange={(e) => {
    const value = e.target.value;
    // Allow only digits and optional "+" at start
    if (/^[+0-9]*$/.test(value)) {
      handleInputChange(e);
    }
  }}
  className={`w-full h-[48px] bg-[#F8F8F8] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none flex items-center rounded-[16px] border ${
    errors.phone ? "border-red-500" : "border-[#EEEEEE]"
  }`}
/>

              {errors.phone && <p className="text-red-500 text-sm font-medium ml-2">Please enter a valid number</p>}
            </div>

            <div className="relative w-[600px]">
              <p className="absolute -top-6 left-0 w-[94px] h-[19px] text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] opacity-100 capitalize leading-[19px]">
                Email Address
              </p>
              <input
                name="email"
                type="text"
                placeholder="Alexadavid@email.com"
                value={user?.email || ""}
                onChange={handleInputChange}
                className={`w-full h-[48px] bg-[#F8F8F8] px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none rounded-[16px] border ${
                  errors.email ? "border-red-500" : "border-[#EEEEEE]"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm font-medium ml-2">Please enter a valid email</p>}
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-[600px] left-[110px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]" />

          {/* Social links rows */}
          <div>
            <div className="absolute top-[650px] left-[110px] flex items-center gap-8">
              {socialLinks.slice(0, 2).map((link, idx) => (
                <div key={idx} className="relative w-[600px]">
                  <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">Social link {idx + 1}</p>
                  <input
                    name="socialLink"
                    type="text"
                    placeholder={`Enter ${platforms[idx]} link`}
                    value={link.url}
                    onChange={(e) => handleInputChange(e, idx)}
                    className={`w-full h-[48px] bg-[#F8F8F8] rounded-[16px] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none border ${
                      socialErrors[idx] ? "border-red-500" : "border-[#EEEEEE]"
                    }`}
                  />
                  {socialErrors[idx] && <p className="text-red-500 text-sm font-medium ml-2">Must start with http://, https://, or www.</p>}
                </div>
              ))}
            </div>

            <div className="absolute top-[750px] left-[110px] flex items-center gap-8">
              <div className="relative w-[600px]">
                <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">Social link 3</p>
                <input
                  name="socialLink"
                  type="text"
                  placeholder={`Enter ${platforms[2]} link`}
                  value={socialLinks[2]?.url || ""}
                  onChange={(e) => handleInputChange(e, 2)}
                  className={`w-full h-[48px] bg-[#F8F8F8] rounded-[16px] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none border ${
                    socialErrors[2] ? "border-red-500" : "border-[#EEEEEE]"
                  }`}
                />
                {socialErrors[2] && <p className="text-red-500 text-sm font-medium ml-2">Must start with http://, https://, or www.</p>}
              </div>

              {/* add button */}
              {socialLinks.length < 4 && (
                <button onClick={handleAddSocialLink} className="w-[48px] h-[48px] bg-gradient-to-r from-[#B306A7] to-[#4C0593] text-white text-2xl font-bold rounded-lg hover:scale-105 transition">
                  +
                </button>
              )}

              {socialLinks[3] && (
                <div className="relative w-[600px]">
                  <p className="absolute -top-6 left-0 text-[16px] font-medium text-[#1E1E1E] capitalize">Social link 4</p>
                  <input
                    name="socialLink"
                    type="text"
                    placeholder={`Enter ${platforms[3]} link`}
                    value={socialLinks[3]?.url || ""}
                    onChange={(e) => handleInputChange(e, 3)}
                    className={`w-full h-[48px] bg-[#F8F8F8] rounded-[16px] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none border ${
                      socialErrors[3] ? "border-red-500" : "border-[#EEEEEE]"
                    }`}
                  />
                  {socialErrors[3] && <p className="text-red-500 text-sm font-medium ml-2">Must start with http://, https://, or www.</p>}
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-[820px] left-[110px] w-[1240px] h-[1px] bg-[#E2E2E2] rounded-[18px]" />

          {/* Bottom-right buttons */}
          <div className="fixed bottom-8 right-6 flex gap-4 z-50">
            <button className="flex items-center gap-3 text-[#232323] text-[16px] font-medium rounded-[16px] bg-[#0000000D] hover:bg-[#00000020] transition px-6 py-3">
              Cancel
            </button>

              <button
        onClick={handleUpdateProfile}
        disabled={hasBannerError || isButtonDisabled || isUpdating}
        className={`flex items-center gap-3 text-white text-[16px] font-medium rounded-[16px] 
    bg-gradient-to-r from-[#B007A7] to-[#4F0594] hover:opacity-90 transition px-6 py-3
    ${(hasBannerError || isButtonDisabled || isUpdating) ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isUpdating ? "Updating..." : "Update Profile"}
      </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
