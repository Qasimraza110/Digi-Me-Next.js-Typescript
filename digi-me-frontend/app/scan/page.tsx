"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";   
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dynamically import scanner to avoid SSR issues
const QrScanner = dynamic(() => import("react-qr-barcode-scanner"), { ssr: false });

export default function ScanPage() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const router = useRouter();
  const hasScannedRef = useRef(false);

const handleScan = async (result: string | null) => {
  if (!result || hasScannedRef.current) return;
  hasScannedRef.current = true;
  setScanned(result);
  setIsCameraActive(false);

  try {
    const res = await fetch("http://localhost:5000/api/qr/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrData: result }),
    });

    const data = await res.json();

    // stop camera before any action
    stopCamera();

    if (res.ok && data.profile) {
      // profile exists → go to profile page
      router.push(`/u/${data.profile.username || data.profile._id}`);
    } else {
      // profile not found → show toast, do not redirect
      toast.error("Profile not found!", {
        position: "top-right",
        style: {
          background: "linear-gradient(to right, #FF3A27, #FF6B4A)",
          color: "#fff",
        },
      });
      hasScannedRef.current = false;
      setIsCameraActive(true); // allow rescanning
    }
  } catch (err) {
    console.error("Error verifying QR:", err);
    toast.error("Error verifying QR!", {
      position: "top-right",
      style: {
        background: "linear-gradient(to right, #FF3A27, #FF6B4A)",
        color: "#fff",
      },
    });
    hasScannedRef.current = false;
    setIsCameraActive(true);
  }
};


  const stopCamera = async () => {
    const videoEl = document.querySelector("video");
    if (videoEl && videoEl.srcObject) {
      const stream = videoEl.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoEl.srcObject = null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0F172A] text-white space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        📷 Scan QR Code
      </h2>

      <div className="relative w-[300px] h-[300px] border border-gray-600 rounded-2xl overflow-hidden bg-black shadow-lg">
        {isCameraActive ? (
          <div className="w-full h-full relative">
            <QrScanner
              onUpdate={(_viewFinder: unknown, result: any) => {
                if (result?.text) handleScan(result.text);
              }}
              facingMode="environment"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
          
          </div>
        )}
      </div>

      {scanned && ( 
        <p className="text-green-400 break-all text-center max-w-[90%]">
          ✅ Scanned: {scanned}
        </p>
      )}

      <ToastContainer />

      {/* ✅ Style fix for video aspect & black line */}
      <style jsx global>{`
        video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
        }
        canvas {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
