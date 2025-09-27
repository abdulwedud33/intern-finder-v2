"use client";

import {
  Home,
  MessageSquare,
  FileText,
  Search,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
    },
    {
      href: "/applications",
      label: "My Applications",
      icon: FileText,
    },
    {
      href: "/company",
      label: "Company",
      icon: Search,
    },
    {
      href: "/dashboard/myprofile",
      label: "My Profile",
      icon: User,
    },
  ];

  const settingsLinks = [
    {
      href: "/settings",
      label: "Setting",
      icon: Settings,
    },
    {
      href: "/support",
      label: "Support",
      icon: HelpCircle,
    },
  ];

  return (
    <aside className="h-screen w-64 bg-[#f3f9f8] flex flex-col justify-between border-r">
      <div>
        <nav className="mt-24">
          <ul className="space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-6 py-3 rounded-l-full font-semibold ${
                    pathname === href
                      ? "bg-[#cbe6e2] text-[#1a3c34]"
                      : "hover:bg-[#e6f2f0] text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t my-4 mx-6" />
        <div className="px-6 py-2 text-xs font-bold text-gray-700">
          SETTINGS
        </div>
        <ul className="space-y-1">
          {settingsLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-6 py-3 rounded-l-full ${
                  pathname === href
                    ? "bg-[#cbe6e2] text-[#1a3c34] font-semibold"
                    : "hover:bg-[#e6f2f0] text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3 px-6 py-4">
        <Image
          src="/avatar.jpg"
          alt="User Avatar"
          width={36}
          height={36}
          className="rounded-full border"
        />
        <div>
          <div className="font-semibold text-sm">Jaye Gyil</div>
          <div className="text-xs text-gray-500">ralphedwards@gmsle.com</div>
        </div>
      </div>
    </aside>
  );
}
