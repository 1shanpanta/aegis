// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState } from "react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { isPrivyConfigured } from "../lib/PrivyAppProvider";

const truncate = (s: string | undefined, head = 6, tail = 4): string => {
  if (!s) return "—";
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
};

const userLabel = (u: ReturnType<typeof usePrivy>["user"]): string => {
  if (!u) return "";
  if (u.email?.address) return u.email.address;
  if (u.google?.email) return u.google.email;
  if (u.github?.username) return `@${u.github.username}`;
  if (u.wallet?.address) return truncate(u.wallet.address, 6, 4);
  if (u.id) return truncate(u.id, 6, 4);
  return "signed in";
};

const AuthButtonInner = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!ready) {
    return (
      <div className="h-[34px] px-3.5 rounded-full bg-ink-900/40 border border-ink-800/70 flex items-center text-[11px] text-ink-500 font-mono uppercase tracking-[0.18em]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink-700 mr-2 animate-pulse" />
        loading
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={login}
        className="h-[34px] px-4 rounded-full bg-ink-50 text-ink-950 hover:bg-white text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        Sign in
      </button>
    );
  }

  const label = userLabel(user);
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="h-[34px] inline-flex items-center gap-2 px-3.5 rounded-full bg-ink-900/50 border border-ink-700/70 backdrop-blur-md text-[12px] text-ink-100 hover:border-ink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-400 shadow-[0_0_0_3px_rgba(96,165,250,0.18)]" />
        <span className="max-w-[160px] truncate tabular-nums">{label}</span>
        <ChevronDown className="w-3 h-3 text-ink-400" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[240px] rounded-xl border border-ink-700/80 bg-ink-900/95 backdrop-blur-md shadow-2xl shadow-ink-950/60 overflow-hidden z-30"
        >
          <div className="px-4 py-3 border-b border-ink-800">
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-500 mb-1">
              Signed in
            </div>
            <div className="text-[13px] text-ink-100 truncate">{label}</div>
            {user?.wallet?.address && (
              <div className="font-mono text-[11px] text-ink-500 mt-1 truncate">
                {truncate(user.wallet.address, 10, 8)}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-3 text-[13px] text-ink-200 hover:bg-ink-800/80 hover:text-ink-50 transition-colors flex items-center gap-2.5 focus-visible:outline-none focus-visible:bg-ink-800/80"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export const AuthButton = () => {
  if (!isPrivyConfigured()) return null;
  return <AuthButtonInner />;
};
