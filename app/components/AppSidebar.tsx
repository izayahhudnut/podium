"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiMessageSquare,
  FiTag,
  FiCopy,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const navItems = [
  { label: "Home", href: "/home", icon: FiHome },
  { label: "Rooms", href: "/rooms", icon: FiMessageSquare },
  { label: "Topics", href: "/topics", icon: FiTag },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <aside
      className={`hidden flex-col gap-8 border-r border-white/10 bg-[#0f0f12] py-6 text-white transition-all duration-300 ease-out lg:flex ${
        collapsed ? "w-20 px-4" : "w-64 px-6"
      }`}
    >
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-white">Podium</p>
          </div>
        )}
        <button
          className="hidden items-center justify-center text-white/60 transition hover:text-white lg:flex"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FiMenu className="h-5 w-5" />
          ) : (
            <FiX className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav
        className={`grid gap-2 text-sm ${
          collapsed ? "justify-items-center" : ""
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/rooms" && pathname.startsWith("/rooms"));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "w-12 justify-center" : ""}`}
              aria-label={item.label}
            >
              <Icon
                className={`text-white/60 transition group-hover:text-white ${
                  collapsed ? "h-6 w-6" : "h-5 w-5"
                }`}
              />
              {!collapsed && (
                <span className="transition group-hover:text-white">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center justify-between rounded-full border border-white/15 bg-[#17171a] px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-[#1d1d22]">
              <span className="flex items-center gap-2">Need help</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e5e7eb] text-[10px] font-semibold text-[#0b0b0c]">
                ?
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#121214] p-0 text-white">
            <div className="px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                Need help
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                Email support
              </p>
              <p className="mt-1 text-sm text-white/60">
                Reach our support team directly.
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#18181d] px-4 py-3 text-sm">
                <span className="font-medium text-white/70">
                  support@podiumlive.io
                </span>
                <button
                  type="button"
                  className="ml-auto inline-flex items-center justify-center text-white/60 transition hover:text-white"
                  onClick={async () => {
                    await navigator.clipboard.writeText("support@podiumlive.io");
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1200);
                  }}
                  aria-label="Copy email"
                >
                  <FiCopy className="h-4 w-4" />
                </button>
              </div>
              {copied && (
                <p className="mt-2 text-xs text-emerald-400">
                  Copied to clipboard
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  );
}
