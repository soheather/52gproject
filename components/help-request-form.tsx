"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { getEmojiForContent } from "@/lib/emoji-helper"
import { useToast } from "@/hooks/use-toast"
import { supabase, HELP_REQUESTS_TABLE, ensureHelpRequestsTable } from "@/lib/supabase"

export function HelpRequestForm() {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTableReady, setIsTableReady] = useState(false)
  const { toast } = useToast()

  // 컴포넌트 마운트 시 테이블이 존재하는지 확인
  useEffect(() => {
    async function checkTable() {
      const tableExists = await ensureHelpRequestsTable()
      setIsTableReady(tableExists)

      if (!tableExists) {
        toast({
          title: "데이터베이스 연결 오류",
          description: "도움 요청을 저장할 테이블을 찾을 수 없습니다.",
          variant: "destructive",
        })
      }
    }

    checkTable()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "도움이 필요한 내용을 작성해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!isTableReady) {
      toast({
        title: "데이터베이스 연결 오류",
        description: "도움 요청을 저장할 테이블이 준비되지 않았습니다.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 새 도움 요청 생성
      const emoji = getEmojiForContent(content)

      // Supabase에 데이터 저장
      const { data, error } = await supabase
        .from(HELP_REQUESTS_TABLE)
        .insert([
          {
            content,
            emoji,
            author: "익명",
            views: 0,
            likes: 0,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // 폼 초기화
      setContent("")

      // 이벤트 발생 (HelpRequestList가 감지할 수 있도록)
      window.dispatchEvent(new CustomEvent("help-request-added"))

      toast({
        title: "도움 요청이 등록되었습니다",
        description: "여러분의 요청이 성공적으로 등록되었습니다.",
      })
    } catch (error) {
      console.error("도움 요청 등록 오류:", error)
      toast({
        title: "오류가 발생했습니다",
        description: "도움 요청을 등록하는 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4">
        <Textarea
          placeholder="어떤 도움이 필요하신가요?"
          className="min-h-[150px] resize-y border-gray-200 focus:border-[#6366f1] focus:ring-[#6366f1] rounded-lg text-base"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting || !isTableReady}
        />
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            className="bg-[#6366f1] hover:bg-[#5258e0] text-white transition-colors rounded-md px-6"
            disabled={isSubmitting || !isTableReady}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                등록 중...
              </>
            ) : (
              "남기기"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
