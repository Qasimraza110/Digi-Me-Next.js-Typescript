"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ScanPage() {
  const [scanned, setScanned] = useState<string | null>(null);
  const router = useRouter();
  const qrRef = useRef<Html5Qrcode | null>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    qrRef.current = html5QrCode;
    isRunning.current = true;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          async (decodedText) => {
            if (!isRunning.current) return;
            isRunning.current = false; 
            setScanned(decodedText);

            try {
              await html5QrCode.stop();
              await html5QrCode.clear();

              const res = await fetch("http://localhost:5000/api/qr/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrData: decodedText }),
              });

              const data = await res.json();

              if (res.ok && data.profile) {
                router.push(`/u/${data.profile.username || data.profile._id}`);
              } else {
                // ✅ Check if scanned text is a valid URL
                try {
                  const url = new URL(decodedText);
                  // 🌍 Open unknown valid links in NEW TAB
                  window.open(url.toString(), "_blank");
                } catch {
                  // ❌ Not URL and not profile
                  toast.error("Profile not found!");
                }
              }
            } catch (err) {
              console.error("Error verifying QR:", err);
              toast.error("Error verifying QR!");
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera start failed:", err);
        toast.error("Please allow camera access");
      }
    };

    startScanner();

    return () => {
      const stopScanner = async () => {
        try {
          if (qrRef.current) {
            await qrRef.current.stop();
            await qrRef.current.clear();
          }
        } catch (err) {
          console.warn("Failed to stop QR scanner:", err);
        }
      };
      stopScanner();
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white space-y-4">
      <h2 className="text-xl font-bold">📷 Scan QR Code</h2>

      <div
        id="reader"
        className="w-[300px] h-[300px] border border-gray-600 rounded-lg overflow-hidden"
      ></div>

      {scanned && (
        <p className="text-green-400 break-all max-w-[90%] text-center">
          ✅ Scanned: {scanned}
        </p>
      )}

      <ToastContainer />

      <style jsx global>{`
        #reader__scan_region video {
          object-fit: cover !important;
        }
        #reader__dashboard_section_csr,
        #reader__status_span {
          display: none !important;
        }
        canvas {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
