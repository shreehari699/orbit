"use client";

import { useEffect, useState } from "react";

import { readLocal, writeLocal } from "@/lib/storage/local-store";

const KEY = "orbit.ui.sidebar-collapsed.v1";

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readLocal(KEY, false));
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      writeLocal(KEY, next);
      return next;
    });
  }

  return { collapsed, toggle };
}
