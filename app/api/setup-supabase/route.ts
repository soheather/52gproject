import { NextResponse } from "next/server"

// Supabase 연동 관련 API 엔드포인트이므로 비활성화
export async function GET() {
  return NextResponse.json(
    {
      message: "Supabase 연동이 비활성화되었습니다.",
      status: "disabled",
    },
    { status: 200 },
  )
}
