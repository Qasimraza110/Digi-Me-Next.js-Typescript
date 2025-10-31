"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full h-[47px] bg-gradient-to-r from-[#B007A7] to-[#4F0594] flex items-center justify-center mt-auto">
      <p className="text-white text-[12px] font-roboto font-normal leading-none text-center">
        © {new Date().getFullYear()} All Rights Reserved by Novatore Solutions.
      </p>
    </footer>
  );
}
