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
  const [socialErrors, setSocialErrors] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

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
          if (updated.coverAvatar)
            setBannerImage(`${API}${updated.coverAvatar}`);
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
  const handleProfileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      if (name === "username")
        newErrors.username = !validateUsername(value).isValid;
      if (name === "email") newErrors.email = !validateEmail(value).isValid;
      if (name === "phone") newErrors.phone = !validatePhone(value).isValid;
      if (name === "bio") newErrors.bio = !validateBio(value).isValid;
      return newErrors;
    });
  };

  const handleAddSocialLink = () => {
    if (socialLinks.length >= 4) return;
    setSocialLinks((prev) => [
      ...prev,
      { name: `social${prev.length + 1}`, url: "" },
    ]);
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

    const socialValidationResults = socialLinks.map((s) =>
      validateSocialLink(s.url)
    );
    const anySocialInvalid = socialValidationResults.some((r) => !r.isValid);
    if (anySocialInvalid) {
      const updatedSocialErrors = socialValidationResults.map(
        (r) => !r.isValid
      );
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
      const payload = {
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        website: user.website,
        socialLinks,
      };
      formData.append("json", JSON.stringify(payload));

      if (profileInputRef.current?.files?.[0])
        formData.append("avatar", profileInputRef.current.files[0]);
      if (bannerInputRef.current?.files?.[0] && !hasBannerError)
        formData.append("coverAvatar", bannerInputRef.current.files[0]);

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

      <div className="relative flex-1 overflow-auto px-4 sm:px-6 md:px-16 lg:px-[75px]">
        <NavBar />
        <div
          className="fixed top-0 right-0 w-[25%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
          style={{ zIndex: 1 }}
        />
        <div
          className="fixed bottom-0 left-0 w-[25%] h-[50vh] bg-[url('/accountpage2.svg')] bg-no-repeat bg-contain bg-bottom pointer-events-none"
          style={{ zIndex: 1 }}
        />

        <div className="relative max-w-[1440px] mx-auto">
          {/* Banner */}
          <div className="w-[95%] max-w-[1240px] aspect-[16/6] lg:aspect-[1240/216] rounded-2xl bg-[#D9D9D9] overflow-hidden relative mx-auto">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300 bg-[url('/profilebanner.png')]"
              style={{ backgroundImage: `url(${bannerImage})` }}
            />
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
            <input
              type="file"
              accept="image/*"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>

          {/* Profile image */}
          <div className="flex flex-col lg:flex-row lg:items-start mt-3 w-full max-w-6xl mx-auto">
            {/* Profile Picture */}
            <div className="w-40 h-40 lg:w-[198px] lg:h-[198px] rounded-full p-[5px] bg-gradient-to-r from-[#B008A6] via-[#8C099F] to-[#540A95] relative -mt-20 lg:-mt-32 mx-auto lg:mx-0 lg:flex-shrink-0 lg:-translate-x-11">
              <div className="w-full h-full bg-white rounded-full overflow-hidden">
                <img
                  src={profilePreview || "/user.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Edit Profile Icon */}
              <div
                className="absolute bottom-2 right-2 rounded-full p-2 z-30 cursor-pointer hover:scale-110 transition-transform"
                onClick={handleProfileClick}
              >
                <Image
                  src="/pencil.svg"
                  alt="Edit Profile"
                  width={25}
                  height={25}
                />
              </div>

              <input
                type="file"
                accept="image/*"
                ref={profileInputRef}
                onChange={handleProfileChange}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col mt-6 lg:mt-0 lg:ml-0">
              <div className="flex flex-col lg:flex-row lg:gap-6 gap-5">
                {/* Username */}
                <div className="w-full lg:w-[490px] flex flex-col">
                  <label className="block mb-1 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E]">
                    Profile Name
                  </label>
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
                  {/* Reserve space to prevent layout shift */}
                  
                    {errors.username ? <p className="text-red-500 text-sm font-medium mt-1 min-h-[20px]">
                      ? "Username can only contain letters, numbers, and underscores"
                     
                  </p> : ""}
                </div>

                {/* Website */}
                <div className="w-full lg:w-[480px] flex flex-col">
                  <label className="block mb-1 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E]">
                    Website URL
                  </label>
                  <input
                    name="website"
                    type="text"
                    placeholder="http://www.zencorporation.com"
                    value={user?.website || ""}
                    onChange={handleInputChange}
                    className="w-full h-[48px] bg-[#F8F8F8] border border-[#EEEEEE] rounded-[16px] px-4 text-[16px] font-medium font-['Roboto'] text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none"
                  />
                  {/* Reserve space for potential website error */}
                  <p className="text-red-500 text-sm font-medium mt-1 min-h-[20px]"></p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-4 lg:px-0 mt-0 flex flex-col gap-6">
            {/* Bio */}
            <div className="flex flex-col gap-1">
              <label className="text-[16px] font-medium font-['Roboto'] text-[#1E1E1E]">
                Bio
              </label>
              <textarea
                name="bio"
                value={user?.bio || ""}
                onChange={handleInputChange}
                placeholder="Lorem ipsum dolor sit amet..."
                maxLength={400}
                className={`w-full h-[88px] bg-[#F8F8F8] rounded-[16px] px-4 py-2 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none resize-none border ${
                  errors.bio ? "border-red-500" : "border-[#EEEEEE]"
                }`}
              />
              <div className="flex justify-between items-center ">
                {errors.bio && (
                  <p className="text-red-500 text-sm font-medium">
                    Bio is invalid, no more than 400 words
                  </p>
                )}
                <span className="text-gray-500  text-sm ml-auto">
                  {user?.bio?.length || 0}/400
                </span>
              </div>
            </div>

            {/* Phone + Email */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Phone */}
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[16px] font-medium text-[#1E1E1E] capitalize">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="text"
                  placeholder="+1 234 567 8901"
                  value={user?.phone || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    // ✅ Only allow + and digits, and limit to 15 characters total
                    if (/^[+0-9]*$/.test(value) && value.length <= 15) {
                      handleInputChange(e);
                    }
                  }}
                  className={`w-full h-[48px] bg-[#F8F8F8] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none rounded-[16px] `}
                />

              </div>

              {/* Email */}
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[16px] font-medium text-[#1E1E1E] capitalize">
                  Email Address
                </label>
                <input
                  name="email"
                  type="text"
                  placeholder="Alexadavid@email.com"
                  value={user?.email || ""}
                  onChange={handleInputChange}
                  className={`w-full h-[48px] bg-[#F8F8F8] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none rounded-[16px] border ${
                    errors.email ? "border-red-500" : "border-[#EEEEEE]"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm font-medium">
                    Please enter a valid email
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {socialLinks.map((link, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[16px] font-medium text-[#1E1E1E] capitalize">
                      Social link {idx + 1}
                    </label>
                    <input
                      name="socialLink"
                      type="text"
                      placeholder={`Enter ${platforms[idx]} link`}
                      value={link.url}
                      onChange={(e) => handleInputChange(e, idx)}
                      className={`w-full h-[48px] bg-[#F8F8F8] rounded-[16px] px-4 text-[16px] font-medium text-[#1E1E1E] placeholder:text-gray-400 focus:outline-none border ${
                        socialErrors[idx]
                          ? "border-red-500"
                          : "border-[#EEEEEE]"
                      }`}
                    />
                    {socialErrors[idx] && (
                      <p className="text-red-500 text-sm font-medium">
                        Must start with http://, https://, or www.
                      </p>
                    )}
                  </div>

                  {/* Add button only for last input if less than 4 */}
                  {idx === socialLinks.length - 1 && socialLinks.length < 4 && (
                    <button
                      onClick={handleAddSocialLink}
                      className="w-[48px] h-[48px] bg-gradient-to-r from-[#B306A7] to-[#4C0593] text-white text-2xl font-bold rounded-lg hover:scale-105 transition"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons aligned to right (not fixed) */}
            <div className="flex justify-end gap-4 mt-4 mb-6">
              <button className="flex items-center gap-3 text-[#232323] text-[16px] font-medium rounded-[16px] bg-[#0000000D] hover:bg-[#00000020] transition px-6 py-3">
                Cancel
              </button>

              <button
                onClick={handleUpdateProfile}
                disabled={hasBannerError || isButtonDisabled || isUpdating}
                className={`flex items-center gap-3 text-white text-[16px] font-medium rounded-[16px] 
                  bg-gradient-to-r from-[#B007A7] to-[#4F0594] hover:opacity-90 transition px-6 py-3
                  ${
                    hasBannerError || isButtonDisabled || isUpdating
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
              >
                {isUpdating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
