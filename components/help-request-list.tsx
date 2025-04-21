"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { MessageCircle, Loader2, RefreshCw, Clock, ThumbsUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { HelpRequestCard } from "./help-request-card"
import { supabase, HELP_REQUESTS_TABLE, ensureHelpRequestsTable } from "@/lib/supabase"

type HelpRequest = {
  id: string
  content: string
  emoji: string
  created_at: string
  author: string
  views?: number
  likes?: number
}

type SortOption = "latest" | "oldest" | "popular"

export function HelpRequestList() {
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTableReady, setIsTableReady] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>("latest")
  const [isSorting, setIsSorting] = useState(false)

  // 도움 요청 목록 로드
  const loadRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // 테이블이 존재하는지 확인
      const tableExists = await ensureHelpRequestsTable()
      setIsTableReady(tableExists)

      if (!tableExists) {
        throw new Error("도움 요청 테이블이 존재하지 않습니다.")
      }

      // Supabase에서 데이터 가져오기
      const { data, error } = await supabase
        .from(HELP_REQUESTS_TABLE)
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setRequests(data || [])
    } catch (error) {
      console.error("도움 요청 목록 로드 오류:", error)
      setError("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 및 새 요청 추가 시 목록 로드
  useEffect(() => {
    loadRequests()

    // 새 요청 추가 이벤트 리스너
    const handleNewRequest = () => {
      loadRequests()
    }

    window.addEventListener("help-request-added", handleNewRequest)

    return () => {
      window.removeEventListener("help-request-added", handleNewRequest)
    }
  }, [])

  // 정렬 함수
  const sortRequests = (option: SortOption) => {
    setIsSorting(true)
    setSortOption(option)

    const sortedRequests = [...requests]

    switch (option) {
      case "latest":
        sortedRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        sortedRequests.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "popular":
        sortedRequests.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        break
    }

    // 약간의 지연 후 정렬된 결과 적용 (애니메이션 효과를 위해)
    setTimeout(() => {
      setRequests(sortedRequests)
      setIsSorting(false)
    }, 50)
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko })
    } catch (error) {
      return "날짜 정보 없음"
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-[#6366f1] mx-auto" />
        <p className="mt-4 text-[#6e6e85]">도움 요청 목록을 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl shadow-sm">
        <p className="text-red-500 font-medium">{error}</p>
        <Button onClick={loadRequests} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-[#f1f1f5] rounded-xl shadow-sm">
        <MessageCircle className="h-12 w-12 text-[#6366f1] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#2d2d2d]">아직 도움 요청이 없습니다</h3>
        <p className="text-[#6e6e85] mt-2">첫 번째 도움 요청을 남겨보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 정렬 옵션 버튼 */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={sortOption === "latest" ? "default" : "outline"}
          size="sm"
          onClick={() => sortRequests("latest")}
          className={`${sortOption === "latest" ? "bg-[#6366f1] hover:bg-[#5258e0]" : ""}`}
          disabled={isSorting}
        >
          <Clock className="h-4 w-4 mr-2" />
          최신순
        </Button>
        <Button
          variant={sortOption === "oldest" ? "default" : "outline"}
          size="sm"
          onClick={() => sortRequests("oldest")}
          className={`${sortOption === "oldest" ? "bg-[#6366f1] hover:bg-[#5258e0]" : ""}`}
          disabled={isSorting}
        >
          <Clock className="h-4 w-4 mr-2" />
          오래된순
        </Button>
        <Button
          variant={sortOption === "popular" ? "default" : "outline"}
          size="sm"
          onClick={() => sortRequests("popular")}
          className={`${sortOption === "popular" ? "bg-[#6366f1] hover:bg-[#5258e0]" : ""}`}
          disabled={isSorting}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          인기순
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        {requests.map((request, index) => (
          <HelpRequestCard
            key={request.id}
            request={request}
            formatDate={formatDate}
            index={index}
            isSorting={isSorting}
          />
        ))}
      </div>
    </div>
  )
}
