// lib/notion.ts
// 서버 액션을 사용하도록 수정

import { fetchNotionData as fetchNotionDataAction } from "@/app/actions/notion"

export async function fetchNotionData(options: { forceRefresh?: boolean; databaseId?: string }) {
  try {
    // 서버 액션을 호출하여 Notion 데이터 가져오기
    return await fetchNotionDataAction(options)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Notion API 호출 중 예외 발생: ${errorMessage}`)

    // 오류 발생 시 빈 결과 반환
    return {
      results: [],
      error: `Notion API 호출 중 오류가 발생했습니다: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    }
  }
}
