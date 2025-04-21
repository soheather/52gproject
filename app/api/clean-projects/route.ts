import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  return NextResponse.json(
    {
      message: "Supabase 연동이 비활성화되었습니다.",
      status: "disabled",
    },
    { status: 200 },
  )
}
