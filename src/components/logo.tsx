"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 150, height = 40, className }: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div
        style={{ width, height }}
        className={className}
        aria-label="Zenith Logo"
      />
    );
  }

  // Determine which logo to show based on theme
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc =
    currentTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  return (
    <Image
      src={logoSrc}
      alt="Zenith"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
