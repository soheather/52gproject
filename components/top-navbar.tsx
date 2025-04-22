"use client"

import type React from "react"
import { Home, FileText, Menu, ListTodo, HelpCircle } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

// Rename the component to TopNavbar
export function TopNavbar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <div className="w-full bg-white border-b border-[#f0f0f5] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image src="/images/52g_logo.png" alt="52g Logo" width={36} height={36} />
            <span className="ml-3 font-semibold text-[#2d2d3d]">디지털 서비스</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 flex justify-center">
            <ul className="flex space-x-6">
              <MenuItemHorizontal icon={<Home size={20} />} title="대시보드" href="/" active={pathname === "/"} />
              <MenuItemHorizontal
                icon={<FileText size={20} />}
                title="디지털 프로덕트 리스트"
                href="/services"
                active={pathname === "/services"}
              />
              <MenuItemHorizontal
                icon={<ListTodo size={20} />}
                title="프로젝트 리스트"
                href="/projects"
                active={pathname === "/projects"}
              />
              <MenuItemHorizontal
                icon={<HelpCircle size={20} />}
                title="도움 요청하기"
                href="/help-requests"
                active={pathname === "/help-requests"}
              />
            </ul>
          </nav>

          {/* Right side - can be used for user profile, etc. */}
          <div>
            <button className="p-1 rounded-md hover:bg-[#f8f8fc]">
              <Menu size={20} className="text-[#a5a6f6]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create a horizontal menu item component
function MenuItemHorizontal({
  icon,
  title,
  href,
  active = false,
}: {
  icon: React.ReactNode
  title: string
  href: string
  active?: boolean
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
          active ? "bg-[#f0f0ff] text-[#7b7bf7]" : "text-[#6e6e85] hover:bg-[#f8f8fc]"
        }`}
      >
        <div className="mr-2">{icon}</div>
        <span className="font-medium">{title}</span>
      </Link>
    </li>
  )
}
