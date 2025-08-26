"use client";

import { useLoadingStore } from "@/store/loadingStore";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";

const GlobalLoader = () => {
  const {
    isLoading,
    loaderColor,
    textColor,
    backgroundColor,
    text,
    hideLoader,
  } = useLoadingStore();

  const pathname = usePathname();
  const prevPath = useRef(null);

  useEffect(() => {
    if (prevPath.current !== null && prevPath.current !== pathname) {
      hideLoader();
    }
    prevPath.current = pathname;
  }, [pathname, hideLoader]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: backgroundColor || "rgba(0, 0, 0, 0.7)", zIndex: 1000000 }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-full flex items-center justify-center">
          <div 
            className="animate-spin rounded-full h-28 w-28 border-b-2" 
            style={{ borderColor: loaderColor || "#3b82f6" }}
          ></div>
        </div>
        {text && (
          <span className="text-lg" style={{ color: textColor || "#fff" }}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default GlobalLoader;