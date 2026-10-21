"use client";

import { useEffect } from "react";

export function AppThemeManager() {
  const applySettings = () => {
    if (typeof window === "undefined") return;

    // Apply Font
    const font = localStorage.getItem("system_font") || "Cairo";
    document.documentElement.style.setProperty("--app-font", `'${font}', sans-serif`);

    // Apply Favicon
    const favicon = localStorage.getItem("system_favicon");
    if (favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = favicon;
    }

    // Apply System Name to Title if custom
    const systemName = localStorage.getItem("system_name");
    if (systemName && document.title.includes("CRM")) {
      document.title = `${systemName} | إدارة الأعمال`;
    }
  };

  useEffect(() => {
    applySettings();

    const handleUpdate = () => {
      applySettings();
    };

    window.addEventListener("system_settings_updated", handleUpdate);
    return () => window.removeEventListener("system_settings_updated", handleUpdate);
  }, []);

  return null;
}
