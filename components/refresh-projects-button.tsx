"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { fetchNotionData } from "@/app/actions/notion"

interface RefreshProjectsButtonProps {
  onRefresh?: (data: any) => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function RefreshProjectsButton({
  onRefresh,
  variant = "default",
  size = "default",
  className = "",
}: RefreshProjectsButtonProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // 캐시 초기화 (로컬 스토리지에서 Notion 관련 캐시 항목 삭제)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("notion-data")) {
          localStorage.removeItem(key)
        }
      })

      // 서버 액션을 통해 최신 데이터 가져오기
      const data = await fetchNotionData({
        forceRefresh: true,
        databaseId: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID_PROJECTS,
      })

      // 콜백 함수가 있으면 데이터 전달
      if (onRefresh) {
        onRefresh(data)
      } else {
        // 콜백이 없으면 페이지 새로고침
        window.location.reload()
      }
    } catch (error) {
      console.error("데이터 새로고침 오류:", error)
      setError(`데이터 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      variant={variant}
      size={size}
      className={`${className} ${error ? "bg-red-500 hover:bg-red-600" : ""}`}
      disabled={refreshing}
    >
      {refreshing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          새로고침 중...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          데이터 새로고침
        </>
      )}
    </Button>
  )
}
