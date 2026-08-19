"use client";

import { useEffect } from "react";

/** Service worker faqat tayyor qurilmada ishga tushadi, ishlab chiqishda emas */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // O'rnatilmasa ham dastur ishlayveradi
    });
  }, []);

  return null;
}
