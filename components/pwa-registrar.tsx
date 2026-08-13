"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export function PWARegistrar() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = () => {
      if (cancelled) return;

      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          console.warn(
            "[PWA] Service worker registration failed:",
            error
          );
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      console.log("[PWA] beforeinstallprompt FIRED");

      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      cancelled = true;
      window.removeEventListener("load", register);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const result = await installPrompt.userChoice;

    console.log("[PWA] install result:", result.outcome);

    setInstallPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <button
      onClick={install}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 99999,
        padding: "12px 18px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,.12)",
        background: "#ffffff",
        color: "#111111",
        fontSize: 15,
        fontWeight: 600,
        boxShadow: "0 6px 24px rgba(0,0,0,.15)",
      }}
    >
      安装 float
    </button>
  );
}
