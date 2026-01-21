"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import {
  Menu,
  X,
  Home,
  Dog,
  Calendar,
  Briefcase,
  ShoppingCart,
  Settings,
} from "lucide-react";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const navLinks = isSignedIn
    ? [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/pets", label: "My Pets", icon: Dog },
        { href: "/care-plan", label: "Care Plan", icon: Briefcase },
        { href: "/appointments", label: "Appointments", icon: Calendar },
        { href: "/shopping", label: "Shopping", icon: ShoppingCart },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    : [];

  return (
    <>
      {/* Top Navbar - Mobile Only */}
      <nav className="md:hidden bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <Dog size={28} />
            PetCare
          </Link>

          {/* Menu Button and User */}
          <div className="flex items-center gap-4">
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {sidebarOpen && (
          <div className="bg-emerald-600 border-t border-emerald-500">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 py-2 hover:text-blue-100 transition"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:bg-gradient-to-b md:from-emerald-500 md:to-emerald-700 md:text-white md:shadow-lg md:flex md:flex-col md:z-50">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-emerald-400">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <Dog size={28} />
            PetCare
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-400 transition"
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        {isSignedIn && (
          <div className="px-6 py-6 border-t border-emerald-400">
            <div className="flex justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Navbar;
