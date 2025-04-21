"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { fetchNotionData } from "@/app/actions/notion"

interface RefreshProjectsButtonProps {
  onRefresh?: (data: any) => void
  className?: string
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function RefreshProjectsButton({
  onRefresh,
  className = "",
  variant = "default",
  size = "default",
}: RefreshProjectsButtonProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  // 컴포넌트 마운트 시 현재 시간으로 초기화
  useEffect(() => {
    const savedTime = localStorage.getItem("projects-last-updated")
    if (savedTime) {
      setLastUpdated(savedTime)
    } else {
      const currentTime = new Date().toLocaleString("ko-KR")
      setLastUpdated(currentTime)
      localStorage.setItem("projects-last-updated", currentTime)
    }
  }, [])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setStatus("idle")
      console.log("프로젝트 데이터 새로고침 시작...")

      // 서버 액션을 통해 Notion API에서 최신 데이터 가져오기
      const notionData = await fetchNotionData({
        forceRefresh: true,
        databaseId: process.env.NOTION_DATABASE_ID_PROJECTS,
      })

      if (notionData.error) {
        console.error("데이터 새로고침 오류:", notionData.error)
        setStatus("error")
        throw new Error(notionData.error)
      }

      // 데이터 검증: stage 필드 확인
      if (notionData.results && notionData.results.length > 0) {
        const firstItem = notionData.results[0]
        const stageProperty = Object.keys(firstItem.properties).find((key) => key.toLowerCase() === "stage")

        if (stageProperty) {
          console.log(`새로고침 성공: Stage 속성 확인됨 (${stageProperty})`)
        } else {
          console.warn("새로고침 경고: Stage 속성을 찾을 수 없습니다!")
        }
      }

      // 최신 업데이트 시간 갱신
      const currentTime = new Date().toLocaleString("ko-KR")
      setLastUpdated(currentTime)
      localStorage.setItem("projects-last-updated", currentTime)

      // 성공 상태 설정
      setStatus("success")
      console.log(`프로젝트 데이터 새로고침 성공: ${notionData.results?.length || 0}개 항목`)

      // 부모 컴포넌트에 데이터 전달
      if (onRefresh) {
        onRefresh(notionData)
      }

      // 성공 메시지 표시 후 상태 초기화
      setTimeout(() => {
        setStatus("idle")
      }, 3000)

      return notionData
    } catch (error) {
      console.error("데이터 새로고침 오류:", error)
      setStatus("error")

      // 3초 후 상태 초기화
      setTimeout(() => {
        setStatus("idle")
      }, 3000)

      throw error
    } finally {
      // 약간의 지연 후 로딩 상태 해제 (UX 개선)
      setTimeout(() => {
        setRefreshing(false)
      }, 800)
    }
  }

  return (
    <div className={`flex flex-col items-end ${className}`}>
      <Button
        onClick={handleRefresh}
        disabled={refreshing}
        variant={variant}
        size={size}
        className={`relative ${status === "success" ? "bg-green-600 hover:bg-green-700" : status === "error" ? "bg-red-600 hover:bg-red-700" : ""}`}
      >
        {refreshing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            데이터 새로고침 중...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            새로고침 완료
          </>
        ) : status === "error" ? (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            새로고침 실패
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            데이터 새로고침
          </>
        )}
      </Button>
      {lastUpdated && <span className="text-xs text-[#6e6e85] mt-1">최근 업데이트: {lastUpdated}</span>}
    </div>
  )
}
