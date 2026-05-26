import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Sparkles,
  LogOut,
  Wallet,
  UserCircle,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Navigation items
const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/income", icon: TrendingUp, label: "Income" },
  { to: "/expense", icon: TrendingDown, label: "Expenses" },
  { to: "/ai-report", icon: Sparkles, label: "AI Report" },
  { to: "/profile", icon: UserCircle, label: "Profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Logout user
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sidebar content
  const SidebarContent = () => (
    <>
      {/* App logo */}
      <NavLink
        to="/dashboard"
        className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center justify-center">
          <img
            src={isDark ? "/favicon-dark.svg" : "/favicon-light.svg"}
            alt="Spendly"
            className="w-9 h-9 object-contain"
          />
        </div>

        <span
          className="font-display text-lg font-semibold"
          style={{ color: "#4F8EF7" }}
        >
          Spendly
        </span>
      </NavLink>

      {/* User details */}
      <div
        className="flex items-center gap-3 mb-8 px-3 py-3 rounded-xl"
        style={{
          background: isDark ? "#1C1F26" : "#F1F5F9",
          border: `1px solid ${isDark ? "#2A2D35" : "#E2E8F0"}`
        }}
      >
        <div className="w-9 h-9 rounded-full bg-[#4F8EF7] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: isDark ? "#E2E8F0" : "#1E293B" }}
          >
            {user?.name || "User"}
          </p>

          <p
            className="text-xs truncate"
            style={{ color: isDark ? "#64748B" : "#94A3B8" }}
          >
            {user?.email || ""}
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#4F8EF7] text-white shadow-lg shadow-blue-500/20"
                  : isDark
                  ? "text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1C1F26]"
                  : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Toggle theme */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-4 w-full"
        style={{ color: "#64748B" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? "#1C1F26" : "#F1F5F9";
          e.currentTarget.style.color = isDark ? "#E2E8F0" : "#1E293B";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#64748B";
        }}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-1 w-full"
        style={{ color: "#64748B" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? "#1C1F26" : "#F1F5F9";
          e.currentTarget.style.color = isDark ? "#E2E8F0" : "#1E293B";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#64748B";
        }}
      >
        <LogOut size={17} />
        Logout
      </button>
    </>
  );

  const sidebarBg = isDark ? "#16181D" : "#FFFFFF";
  const sidebarBorder = isDark ? "#2A2D35" : "#E2E8F0";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-64 min-h-screen flex-col px-5 py-8 fixed left-0 top-0 z-40"
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: sidebarBg,
          borderBottom: `1px solid ${sidebarBorder}`
        }}
      >
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src={isDark ? "/favicon-dark.svg" : "/favicon-light.svg"}
            alt="Spendly"
            className="w-7 h-7 object-contain"
          />

          <span
            className="font-display text-base font-semibold"
            style={{ color: "#4F8EF7" }}
          >
            Spendly
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: isDark ? "#1C1F26" : "#F1F5F9",
              border: `1px solid ${sidebarBorder}`,
              color: "#64748B"
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Open sidebar */}
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isDark ? "#1C1F26" : "#F1F5F9",
              border: `1px solid ${sidebarBorder}`,
              color: "#64748B"
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-72 z-50 flex flex-col px-5 py-8 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`
        }}
      >
        {/* Close sidebar */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: isDark ? "#1C1F26" : "#F1F5F9",
            color: "#64748B"
          }}
        >
          <X size={16} />
        </button>

        <SidebarContent />
      </div>
    </>
  );
}