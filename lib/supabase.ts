import { createClient } from "@supabase/supabase-js"

// 환경 변수에서 Supabase URL과 익명 키를 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// 클라이언트 사이드에서 사용할 Supabase 클라이언트 인스턴스를 생성합니다
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 도움 요청 테이블 이름
export const HELP_REQUESTS_TABLE = "help_requests"

// 테이블이 존재하는지 확인하는 함수
export async function ensureHelpRequestsTable() {
  try {
    // 테이블이 존재하는지 확인
    const { error } = await supabase.from(HELP_REQUESTS_TABLE).select("id").limit(1)

    // 오류가 없으면 테이블이 존재함
    return !error
  } catch (err) {
    console.error("테이블 확인 오류:", err)
    return false
  }
}
