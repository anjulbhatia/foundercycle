"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const KEY = "fc.theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const isDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(KEY, next ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {dark ? (
        <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
      )}
    </Button>
  );
}
