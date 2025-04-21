"use server"

import { createClient } from "@supabase/supabase-js"
import { HELP_REQUESTS_TABLE } from "@/lib/supabase"

// 서버 사이드에서 사용할 Supabase 클라이언트
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 도움 요청 총 개수 가져오기
export async function getHelpRequestCount() {
  try {
    const { count, error } = await supabase.from(HELP_REQUESTS_TABLE).select("*", { count: "exact", head: true })

    if (error) {
      console.error("도움 요청 카운트 오류:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("도움 요청 카운트 오류:", error)
    return 0
  }
}

// 도움 요청 ID로 순서 가져오기
export async function getHelpRequestOrder(id: string) {
  try {
    // 모든 도움 요청을 생성일 기준으로 정렬하여 가져옴
    const { data, error } = await supabase
      .from(HELP_REQUESTS_TABLE)
      .select("id")
      .order("created_at", { ascending: true })

    if (error || !data) {
      console.error("도움 요청 순서 오류:", error)
      return null
    }

    // 현재 ID의 인덱스 찾기
    const index = data.findIndex((item) => item.id === id)

    // 인덱스가 유효하면 1부터 시작하는 순서 반환
    return index >= 0 ? index + 1 : null
  } catch (error) {
    console.error("도움 요청 순서 오류:", error)
    return null
  }
}
