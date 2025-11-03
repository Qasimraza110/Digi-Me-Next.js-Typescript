"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/navbar/page";
import Footer from "@/components/footer/page";

import { FiSearch, FiEye, FiGlobe, FiTrash2 } from "react-icons/fi";

interface SavedProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  savedAt: string;
  profileImage?: string;
}

export default function SavedProfilePage() {
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<SavedProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const API = "http://localhost:5000";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch saved profiles
  useEffect(() => {
    if (!token) return router.push("/login");

    const fetchSavedProfiles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/saved", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch saved profiles");
        const profiles = await res.json();
        setSavedProfiles(profiles);
        setFilteredProfiles(profiles);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedProfiles();
  }, [router, token]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProfiles(savedProfiles);
      return;
    }

    const controller = new AbortController();

    const fetchSearchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/saved/search?q=${encodeURIComponent(
            searchTerm
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          let errData: any = {};
          try {
            errData = await res.json();
          } catch {
            errData = { message: "Unknown error" };
          }
          console.error("Search failed:", errData);
          setFilteredProfiles([]); // clear previous results on error
          return;
        }

        const data = await res.json();
        setFilteredProfiles(Array.isArray(data.results) ? data.results : []);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();

    return () => controller.abort();
  }, [searchTerm, savedProfiles, token]);

  const handleRemove = async (profileId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/saved/${profileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to remove profile");

      setSavedProfiles((prev) => prev.filter((p) => p.id !== profileId));
      setFilteredProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch (err) {
      console.error(err);
      alert("Error removing profile");
    }
  };
  const getAvatarUrl = (url: string | undefined) => {
  if (!url) return "/userpic.jpg"; // fallback if no avatar
  return url.startsWith("http") ? url : `${API}${url}`; // Google URLs stay, backend paths prefixed
};

  const handleViewProfile = (username: string) => router.push(`/u/${username}`);

  if (isLoading)
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
        <p className="mt-6 text-gray-700 text-lg">Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <NavBar />
      {/* ✅ Page content wrapper */}
            <div className="relative flex-1 flex justify-center items-start overflow-auto px-4 ">

          <div
        className="fixed top-0 right-0 w-[25%] h-[50vh] bg-[url('/accountpage.svg')] bg-no-repeat bg-contain bg-top pointer-events-none"
        style={{ zIndex: 1 }}
      ></div>

      {/* Left floating image */}
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
      

        {/* Header - Saved Profiles + Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-[65px] mt-[25px] gap-4">
          <h1 className="text-[32px] font-medium text-[#1E1E1E] capitalize leading-[25px] font-['Roboto']">
            Saved Profiles
          </h1>

          {/* Search Input */}
          <div className="relative w-full md:w-[421px] h-[48px]">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full pl-12 pr-4 rounded-[16px] border border-[#EEEEEE] bg-[#F8F8F8] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base font-medium font-['Roboto']"
            />
          </div>
        </div>

        {/* Divider Line */}
        <div className="mt-6 px-[75px]">
          <div className="w-full h-[1px] bg-[#E2E2E2] rounded-[18px]"></div>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-3 items-center rounded-4xl w-[1240px] mx-auto pt-15 gap-x-24 space-y-5">
          {isSearching && (
            <p className="text-gray-500 col-span-full text-center py-10">
              Searching...
            </p>
          )}

          {!isSearching && filteredProfiles.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10">
              No profiles found.
            </p>
          )}

          {!isSearching &&
            filteredProfiles.map((p) => (
              // <div
              //   key={p.id}
              //   className="relative w-full h-[123px] bg-[#FFFFFF0D] border-[1px] border-[#EEEEEE] rounded-3xl  flex items-center"
              // >
              //   <div className="p-2 rounded-full bg-white ">
              //     <div className="border-[2px] border-[#B306A7] rounded-full overflow-hidden flex items-center justify-center">
              //       {/* <Image
              //         src={p.profileImage || "/userpic.jpg"}
              //         width={83}
              //         height={63}
              //         className="rounded-full object-cover"
              //         alt={p.username}
              //       /> */}
              //       <Image
              //         src="/userpic.jpg"
              //         alt="Logo"
              //         width={91}
              //         height={91}
              //         // className="z-10"
              //       />
              //     </div>
              //   </div>

              //   {/* Center - Name + Website */}
              //   <div className="ml-[110px] flex flex-col justify-center">
              //     <p className="font-medium text-gray-900 text-lg">
              //       {p.firstName && p.lastName
              //         ? `${p.firstName} ${p.lastName}`
              //         : p.username}
              //     </p>
              //     <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
              //       <FiGlobe />
              //       <a
              //         href={p.website || "#"}
              //         target="_blank"
              //         rel="noopener noreferrer"
              //         className="underline hover:text-purple-600"
              //       >
              //         {p.website || "Website"}
              //       </a>
              //     </div>
              //   </div>

              //   {/* Right - Action Buttons */}
              //   <div className="absolute right-4 flex flex-col gap-4 top-1/2 -translate-y-1/2">
              //     <button
              //       onClick={() => handleViewProfile(p.username)}
              //       className="w-[38px] h-[38px] rounded-full bg-gradient-to-r from-[#B306A7] to-[#4C0593] flex items-center justify-center text-white hover:scale-110 transition-transform"
              //     >
              //       <FiEye size={20} />
              //     </button>
              //     <button
              //       onClick={() => handleRemove(p.id)}
              //       className="w-[38px] h-[38px] rounded-full bg-[#FF3A272B] flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all"
              //     >
              //       <FiTrash2 size={20} />
              //     </button>
              //   </div>
              // </div>
              <div
                key={p.id}
                className="bg-white/5 border-[1px] border-[#EEEEEE] py-2 flex rounded-3xl items-center gap-3 justify-between h-[123px] relative"
              >
                <div className="relative flex items-center">
                  <div className="absolute left-0 -translate-x-1/2">
                    <div className="border-[3px] border-[#B306A7] w-[91px] h-[91px] rounded-full overflow-hidden">
                     <img
  src={getAvatarUrl(p.profileImage)}
  alt={p.username || "Profile"}
  width={91}
  height={91}
  className="rounded-full"
/>

                    </div>
                  </div>
                  <div className="ml-16">
                    <h1 className="font-medium text-2xl text-[#1E1E1E]">
                      {p?.firstName && p?.lastName
                        ? `${p.firstName} ${p.lastName}`
                        : p?.username || "Alexa David"}
                    </h1>
                    <div className="text-[#383838] flex items-center gap-3">
                      <Image
                        src="/browser.svg"
                        alt="Logo"
                        width={18}
                        height={16}
                      />
                      {p.website ? (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline cursor-pointer text-[#1E1E1E]"
                        >
                          {p.website}
                        </a>
                      ) : (
                        <p className="underline cursor-pointer text-[#1E1E1E]">
                          www.lorimi.com/Home
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 relative">
                  <button
                    onClick={() => handleViewProfile(p.username)}
                    className="w-[38px] h-[38px] rounded-full bg-gradient-to-r from-[#B306A7] to-[#4C0593] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer absolute -right-5 -top-10 border-[1px] border-white"
                  >
                    <FiEye size={20} />
                  </button>
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="w-[38px] h-[38px] rounded-full bg-[#FF3A272B] flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all cursor-pointer absolute -right-5 top-3"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
        </div>
        {/* <div className="grid grid-cols-3 items-center rounded-4xl w-[1240px] mx-auto pt-20 gap-x-24 space-y-5">
          
         
          <div className="bg-white/5 border-[1px] border-[#EEEEEE] py-2 flex rounded-3xl items-center gap-3 justify-between h-[123px] relative">
            <div className="relative flex items-center">
              <div className="absolute left-0 -translate-x-1/2">
                <div className="border-[3px] border-[#B306A7] w-[91px] h-[91px] rounded-full overflow-hidden">
                  <Image
                    src="/userpic.jpg"
                    alt="User"
                    width={91}
                    height={91}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="ml-16">
                <h1 className="font-medium text-2xl text-[#1E1E1E]">
                  Alexa David
                </h1>
                <div className="text-[#383838] flex items-center gap-3">
                  <Image src="/browser.svg" alt="Logo" width={18} height={16} />
                  <p className="underline cursor-pointer">
                    www.lorimi.com/Home
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 relative">
              <button className="w-[38px] h-[38px] rounded-full bg-gradient-to-r from-[#B306A7] to-[#4C0593] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer absolute -right-5 -top-10 border-[1px] border-white">
                <FiEye size={20} />
              </button>
              <button className="w-[38px] h-[38px] rounded-full bg-[#FF3A272B] flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all cursor-pointer absolute -right-5 top-3">
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
          <div className="bg-white/5 border-[1px] border-[#EEEEEE] py-2 flex rounded-3xl items-center gap-3 justify-between h-[123px] relative">
            <div className="relative flex items-center">
              <div className="absolute left-0 -translate-x-1/2">
                <div className="border-[3px] border-[#B306A7] w-[91px] h-[91px] rounded-full overflow-hidden">
                  <Image
                    src="/userpic.jpg"
                    alt="User"
                    width={91}
                    height={91}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="ml-16">
                <h1 className="font-medium text-2xl text-[#1E1E1E]">
                  Alexa David
                </h1>
                <div className="text-[#383838] flex items-center gap-3">
                  <Image src="/browser.svg" alt="Logo" width={18} height={16} />
                  <p className="underline cursor-pointer">
                    www.lorimi.com/Home
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 relative">
              <button className="w-[38px] h-[38px] rounded-full bg-gradient-to-r from-[#B306A7] to-[#4C0593] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer absolute -right-5 -top-10 border-[1px] border-white">
                <FiEye size={20} />
              </button>
              <button className="w-[38px] h-[38px] rounded-full bg-[#FF3A272B] flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all cursor-pointer absolute -right-5 top-3">
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
          <div className="bg-white/5 border-[1px] border-[#EEEEEE] py-2 flex rounded-3xl items-center gap-3 justify-between h-[123px] relative">
            <div className="relative flex items-center">
              <div className="absolute left-0 -translate-x-1/2">
                <div className="border-[3px] border-[#B306A7] w-[91px] h-[91px] rounded-full overflow-hidden">
                  <Image
                    src="/userpic.jpg"
                    alt="User"
                    width={91}
                    height={91}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="ml-16">
                <h1 className="font-medium text-2xl text-[#1E1E1E]">
                  Alexa David
                </h1>
                <div className="text-[#383838] flex items-center gap-3">
                  <Image src="/browser.svg" alt="Logo" width={18} height={16} />
                  <p className="underline cursor-pointer">
                    www.lorimi.com/Home
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 relative">
              <button className="w-[38px] h-[38px] rounded-full bg-gradient-to-r from-[#B306A7] to-[#4C0593] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer absolute -right-5 -top-10 border-[1px] border-white">
                <FiEye size={20} />
              </button>
              <button className="w-[38px] h-[38px] rounded-full bg-[#FF3A272B] flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all cursor-pointer absolute -right-5 top-3">
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        </div> */}
      </div>
      </div>
      <Footer />  
      {/* Right floating image */}
    
    </div>
  );
}
