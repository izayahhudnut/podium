"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiMessageSquare,
  FiTag,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const navItems = [
  { label: "Home", href: "/home", icon: FiHome },
  { label: "Rooms", href: "/rooms", icon: FiMessageSquare },
  { label: "Topics", href: "/topics", icon: FiTag },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden flex-col gap-8 border-r border-black/5 bg-white py-6 lg:flex ${
        collapsed ? "w-20 px-4" : "w-64 px-6"
      }`}
    >
      <div className="flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img src="/small-logo.svg" alt="Podium logo" className="h-8 w-8" />
            <div>
              <p className="text-lg font-semibold">Podium</p>
            </div>
          </div>
        )}
        <button
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:border-black/30 hover:text-black lg:flex"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FiChevronsRight className="h-4 w-4" />
          ) : (
            <FiChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {!collapsed && (
        <button className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm font-medium">
          Izayah's Workspace
          <span className="text-xs text-black/50">IH</span>
        </button>
      )}

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
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                isActive
                  ? "bg-black/5 text-black"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              } ${collapsed ? "w-12 justify-center" : ""}`}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4 text-black/60 transition group-hover:text-black" />
              {!collapsed && (
                <span className="transition group-hover:text-black">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
