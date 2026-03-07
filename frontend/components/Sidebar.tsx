"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  CandlestickChart, Search, Star, BarChart2,
  ChevronLeft, ChevronRight, Sun, Moon, Monitor, Check,
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
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("sidebarCollapsed") === "true") setCollapsed(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!themeOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [themeOpen]);

  const toggle = () =>
    setCollapsed((prev) => {
      localStorage.setItem("sidebarCollapsed", String(!prev));
      return !prev;
    });

  const currentTheme = mounted
    ? (THEMES.find((t) => t.value === theme) ?? THEMES[1])
    : THEMES[1];
  const ThemeIcon = currentTheme.icon;

  const btnBase =
    "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm w-full " +
    "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300";

  const themeButton = (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown menu */}
      {themeOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-36 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
          {THEMES.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setThemeOpen(false); }}
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Icon size={15} />
                {label}
              </span>
              {theme === value && <Check size={13} className="text-blue-500" />}
            </button>
          ))}
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setThemeOpen((o) => !o)}
        title={`Theme: ${currentTheme.label}`}
        className={`${btnBase} ${collapsed ? "justify-center" : ""}`}
      >
        <ThemeIcon size={18} className="shrink-0" />
        {!collapsed && <span className="flex-1 text-left">{currentTheme.label}</span>}
      </button>
    </div>
  );

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Brand */}
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

      {/* Sticky bottom */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-2">
        {collapsed ? (
          /* Collapsed: theme icon above collapse arrow, stacked */
          <div className="flex flex-col gap-1">
            {themeButton}
            <button onClick={toggle} className={`${btnBase} justify-center`}>
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          /* Expanded: theme picker above, collapse below */
          <div className="flex flex-col gap-1">
            {themeButton}
            <button onClick={toggle} className={`${btnBase}`}>
              <ChevronLeft size={18} />
              <span>Collapse</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
