"use client"

import { useState, useEffect } from "react"
import { ThumbsUp } from "lucide-react"
import { supabase, HELP_REQUESTS_TABLE } from "@/lib/supabase"

type HelpRequest = {
  id: string
  content: string
  emoji: string
  created_at: string
  author: string
  views?: number
  likes?: number
}

interface HelpRequestCardProps {
  request: HelpRequest
  formatDate: (date: string) => string
  index: number
  isSorting: boolean
}

export function HelpRequestCard({ request, formatDate, index, isSorting }: HelpRequestCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(request.likes || 0)
  const [requestNumber, setRequestNumber] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // 카드 색상 배열을 이미지의 색상으로 변경
  const cardColors = [
    "bg-[#6366f1] text-white", // 보라색/파란색 (Frame 34442)
    "bg-[#2092FB] text-white", // 파란색 (요청에 따라 변경됨)
    "bg-[#38C68E] text-white", // 녹색 (요청에 따라 변경됨)
    "bg-[#2d2d2d] text-white", // 검정색/다크 그레이 (Frame 34445)
  ]

  // 카드 호버 효과 색상도 업데이트
  const hoverEffects = [
    "hover:bg-[#5258e0]", // 보라색/파란색 호버
    "hover:bg-[#1a7fe0]", // 파란색 호버 (요청에 따라 변경됨)
    "hover:bg-[#2fb77e]", // 녹색 호버 (요청에 따라 변경됨)
    "hover:bg-[#1f1f1f]", // 검정색/다크 그레이 호버
  ]

  // 내용 길이에 따라 카드 크기 결정 (내용이 길면 span-2)
  const isLongContent = request.content.length > 100
  const cardSize = isLongContent ? "col-span-1 md:col-span-2" : "col-span-1"

  // ID 기반으로 색상 선택 (고유한 색상 유지)
  const getColorIndex = () => {
    if (typeof request.id !== "string" || request.id.length === 0) {
      return Math.floor(Math.random() * cardColors.length)
    }

    // UUID의 첫 번째 문자를 사용하여 색상 인덱스 결정
    const firstChar = request.id.charAt(0)
    const charCode = firstChar.charCodeAt(0)
    return charCode % cardColors.length
  }

  const colorIndex = getColorIndex()
  const cardColor = cardColors[colorIndex]
  const hoverEffect = hoverEffects[colorIndex]

  // 요청 번호 계산
  // 요청 번호 계산 - 서버에서 가져온 실제 순서 사용
  useEffect(() => {
    const getRequestNumber = async () => {
      try {
        // 모든 도움 요청을 생성일 기준으로 정렬하여 가져옴
        const { data, error } = await supabase
          .from(HELP_REQUESTS_TABLE)
          .select("id")
          .order("created_at", { ascending: true })

        if (error || !data) {
          console.error("도움 요청 순서 오류:", error)
          return
        }

        // 현재 ID의 인덱스 찾기
        const index = data.findIndex((item) => item.id === request.id)

        // 인덱스가 유효하면 1부터 시작하는 순서 반환
        if (index >= 0) {
          setRequestNumber(index + 1)
        }
      } catch (err) {
        console.error("요청 번호 계산 오류:", err)
      }
    }

    getRequestNumber()
  }, [request.id])

  // 마운트 및 정렬 시 애니메이션 효과
  useEffect(() => {
    if (isSorting) {
      setIsVisible(false)

      // 정렬 중에는 카드를 숨겼다가 순차적으로 표시
      const timer = setTimeout(
        () => {
          setIsVisible(true)
        },
        100 + index * 50,
      ) // 카드마다 약간의 지연 시간을 두어 순차적으로 나타나게 함

      return () => clearTimeout(timer)
    } else {
      // 초기 로드 시 순차적으로 카드 표시
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, index * 50)

      return () => clearTimeout(timer)
    }
  }, [index, isSorting])

  const handleLike = async () => {
    if (!liked) {
      try {
        // 좋아요 수 업데이트
        const newLikes = likes + 1
        setLiked(true)
        setLikes(newLikes)

        // Supabase에 좋아요 수 업데이트
        const { error } = await supabase.from(HELP_REQUESTS_TABLE).update({ likes: newLikes }).eq("id", request.id)

        if (error) {
          console.error("좋아요 업데이트 오류:", error)
          // 실패 시 UI 롤백
          setLiked(false)
          setLikes(likes)
        }
      } catch (error) {
        console.error("좋아요 업데이트 오류:", error)
        // 실패 시 UI 롤백
        setLiked(false)
        setLikes(likes)
      }
    }
  }

  // 좋아요 버튼 색상 - 색상 계열에 맞게 조정
  const likeButtonColor = liked ? (colorIndex <= 1 ? "text-yellow-300" : "text-white") : "opacity-70"

  return (
    <div
      className={`${cardSize} rounded-xl shadow-sm overflow-hidden ${cardColor} ${hoverEffect} transition-all duration-300 hover:shadow-md transform ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      }`}
      style={{
        transitionProperty: "transform, opacity, background-color, box-shadow",
        transitionDuration: "300ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-3xl">{request.emoji}</div>
            <div className="text-xs opacity-80 font-bold">{requestNumber}번째 요청</div>
          </div>

          {/* 좋아요 버튼을 상단으로 이동 */}
          <button
            className={`flex items-center gap-1 ${likeButtonColor} px-2 py-1 rounded-full bg-black bg-opacity-10 hover:bg-opacity-20 transition-all duration-200`}
            onClick={handleLike}
          >
            <ThumbsUp className="h-3 w-3" />
            <span className="text-xs font-medium">{likes}</span>
          </button>
        </div>

        <p className="flex-grow mb-4 whitespace-pre-wrap text-sm leading-relaxed font-medium">{request.content}</p>

        <div className="flex justify-end items-center text-xs opacity-80 mt-auto pt-2 border-t border-white border-opacity-20">
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatDate(request.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
