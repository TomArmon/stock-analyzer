"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  CandlestickChart, Search, Star, BarChart2,
  ChevronLeft, ChevronRight, Sun, Moon, Monitor,
} from "lucide-react";

const NAV = [
  { href: "/",          icon: Search,    label: "Search"    },
  { href: "/watchlist", icon: Star,      label: "Watchlist" },
  { href: "/stats",     icon: BarChart2, label: "Stats"     },
];

const THEMES = [
  { value: "light",  icon: Sun,     label: "Light"  },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark",   icon: Moon,    label: "Dark"   },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("sidebarCollapsed") === "true") setCollapsed(true);
  }, []);

  const toggle = () =>
    setCollapsed((prev) => {
      localStorage.setItem("sidebarCollapsed", String(!prev));
      return !prev;
    });

  const cycleTheme = () => {
    const idx = THEMES.findIndex((t) => t.value === theme);
    setTheme(THEMES[(idx + 1) % THEMES.length].value);
  };

  const currentTheme = mounted
    ? (THEMES.find((t) => t.value === theme) ?? THEMES[1])
    : THEMES[1];
  const ThemeIcon = currentTheme.icon;

  const btnBase =
    "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm " +
    "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300";

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Brand — links to home */}
      <Link
        href="/"
        className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <CandlestickChart size={22} className="text-blue-500 shrink-0" />
        {!collapsed && (
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
            Stock<br />Analyzer
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Sticky bottom — collapse + theme toggle */}
      <div className={`shrink-0 border-t border-slate-100 dark:border-slate-800 p-2 flex gap-1`}>
        <button
          onClick={toggle}
          className={`${btnBase} ${collapsed ? "flex-1 justify-center" : "flex-1"}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={cycleTheme}
          title={`Theme: ${currentTheme.label}`}
          className={`${btnBase} ${collapsed ? "flex-1 justify-center" : ""}`}
        >
          <ThemeIcon size={18} className="shrink-0" />
          {!collapsed && <span>{currentTheme.label}</span>}
        </button>
      </div>
    </aside>
  );
}
