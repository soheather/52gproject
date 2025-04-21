import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Supabase 인증 관련 코드를 제거하고 더미 미들웨어로 대체
export async function middleware(req: NextRequest) {
  // 단순히 요청을 통과시킴
  return NextResponse.next()
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
