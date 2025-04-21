import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("프로젝트 API 호출 시작...")
    console.log("참고: Supabase 연동이 비활성화되었습니다.")

    // 캐시 무효화를 위한 타임스탬프 파라미터 추가
    const timestamp = new Date().toISOString()

    // Supabase 연동이 비활성화되었으므로 빈 결과 반환
    return NextResponse.json({
      results: [],
      count: 0,
      timestamp,
      refreshed: true,
      message: "Supabase 연동이 비활성화되었습니다.",
    })
  } catch (error) {
    console.error("프로젝트 API 예상치 못한 오류:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        refreshed: false,
      },
      { status: 500 },
    )
  }
}
