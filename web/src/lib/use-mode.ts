// SPDX-License-Identifier: Apache-2.0
//
// useMode: persists the simulator/live toggle in localStorage + URL search.

import { useEffect, useState } from "react";

export type Mode = "simulator" | "live";

const STORAGE_KEY = "aegis:mode";

const readInitial = (): Mode => {
  if (typeof window === "undefined") return "simulator";
  const url = new URLSearchParams(window.location.search);
  const fromUrl = url.get("mode");
  if (fromUrl === "live" || fromUrl === "simulator") return fromUrl;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "live" ? "live" : "simulator";
};

export const useMode = (): [Mode, (m: Mode) => void] => {
  const [mode, setMode] = useState<Mode>(() => readInitial());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, mode);
    const url = new URL(window.location.href);
    if (mode === "simulator") {
      url.searchParams.delete("mode");
    } else {
      url.searchParams.set("mode", mode);
    }
    window.history.replaceState({}, "", url.toString());
  }, [mode]);

  return [mode, setMode];
};
