"use client"

import type React from "react"
import { Home, FileText, Menu, ListTodo, HelpCircle } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <div className={`bg-white border-r border-[#f0f0f5] transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex flex-col h-full">
        {/* 로고 및 토글 버튼 */}
        <div className="flex items-center justify-between p-5 border-b border-[#f0f0f5]">
          {!collapsed && (
            <div className="flex items-center">
              <Image src="/images/52g_logo.png" alt="52g Logo" width={36} height={36} />
              <span className="ml-3 font-semibold text-[#2d2d3d]">디지털 서비스</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <Image src="/images/52g_logo.png" alt="52g Logo" width={28} height={28} />
            </div>
          )}
          <button onClick={toggleSidebar} className={`p-1 rounded-md hover:bg-[#f8f8fc] ${collapsed ? "mx-auto" : ""}`}>
            <Menu size={20} className="text-[#a5a6f6]" />
          </button>
        </div>

        {/* 메뉴 항목 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <MenuItem
              icon={<Home size={20} />}
              title="대시보드"
              href="/"
              active={pathname === "/"}
              collapsed={collapsed}
            />
            <MenuItem
              icon={<FileText size={20} />}
              title="디지털 프로덕트 리스트"
              href="/services"
              active={pathname === "/services"}
              collapsed={collapsed}
            />
            <MenuItem
              icon={<ListTodo size={20} />}
              title="프로젝트 리스트"
              href="/projects"
              active={pathname === "/projects"}
              collapsed={collapsed}
            />
            <MenuItem
              icon={<HelpCircle size={20} />}
              title="도움 요청하기"
              href="/help-requests"
              active={pathname === "/help-requests"}
              collapsed={collapsed}
            />
          </ul>
        </nav>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  title,
  href,
  active = false,
  collapsed = false,
}: {
  icon: React.ReactNode
  title: string
  href: string
  active?: boolean
  collapsed?: boolean
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center p-3 rounded-lg transition-colors ${
          active ? "bg-[#f0f0ff] text-[#7b7bf7]" : "text-[#6e6e85] hover:bg-[#f8f8fc]"
        }`}
      >
        <div className={`${collapsed ? "mx-auto" : ""}`}>{icon}</div>
        {!collapsed && <span className="ml-3 font-medium">{title}</span>}
      </Link>
    </li>
  )
}
