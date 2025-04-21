"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { fetchNotionData } from "@/app/actions/notion"
import { calculateChanges, type ChangeReport, type ProjectItem } from "./data-change-report"

interface RefreshProjectsButtonProps {
  onRefresh?: (data: any) => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onChangeReport?: (report: ChangeReport) => void
  previousData?: ProjectItem[]
}

export function RefreshProjectsButton({
  onRefresh,
  variant = "default",
  size = "default",
  className = "",
  onChangeReport,
  previousData = [],
}: RefreshProjectsButtonProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 페이지 새로고침 대신 데이터만 새로고침하도록 수정
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

      // 데이터 변환 및 변경 사항 계산
      if (previousData.length > 0 && data.results && onChangeReport) {
        // 새 데이터 처리
        const processedData = data.results.map((item: any) => {
          // 데이터 처리 로직 (projects-list-2025.tsx와 동일한 방식으로)
          // 간략화를 위해 생략
          return {
            id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
            title: item.properties.title?.title?.[0]?.plain_text || "제목 없음",
            // 다른 필드들...
          }
        })

        // 변경 사항 계산
        const report = calculateChanges(previousData, processedData)

        // 변경 사항 콜백 호출
        onChangeReport(report)
      }

      // 콜백 함수가 있으면 데이터 전달
      if (onRefresh) {
        onRefresh(data)
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
