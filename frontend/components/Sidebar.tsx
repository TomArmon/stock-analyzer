"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendingUp, Search, Star, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";

const NAV = [
  { href: "/",          icon: Search,    label: "Search"    },
  { href: "/watchlist", icon: Star,      label: "Watchlist" },
  { href: "/stats",     icon: BarChart2, label: "Stats"     },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("sidebarCollapsed") === "true") setCollapsed(true);
  }, []);

  const toggle = () =>
    setCollapsed((prev) => {
      localStorage.setItem("sidebarCollapsed", String(!prev));
      return !prev;
    });

  return (
    <aside
      className={`flex flex-col shrink-0 bg-white border-r border-slate-100 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <TrendingUp size={22} className="text-blue-600 shrink-0" />
        {!collapsed && (
          <span className="font-bold text-slate-800 text-sm leading-tight">
            Stock<br />Analyzer
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
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
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-100 p-2">
        <button
          onClick={toggle}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors text-sm ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
