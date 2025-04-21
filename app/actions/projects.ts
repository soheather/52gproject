"use server"

import { fetchWithCache } from "@/lib/cache-utils"

// 캐시 키
const PROJECTS_CACHE_KEY = "projects-data"

// Supabase 관련 코드를 제거하고 Notion API만 사용하도록 수정
export async function fetchProjectsData(options?: { forceRefresh?: boolean }) {
  // 기본적으로 강제 새로고침 옵션을 true로 설정하여 항상 최신 데이터를 가져오도록 함
  const { forceRefresh = true } = options || {}

  console.log(`fetchProjectsData 호출됨 (forceRefresh: ${forceRefresh})`)
  console.log("참고: Supabase 연동이 비활성화되었습니다. Notion API만 사용합니다.")

  return fetchWithCache(
    PROJECTS_CACHE_KEY,
    async () => {
      try {
        // 목업 데이터 반환
        return {
          results: [],
          count: 0,
          timestamp: new Date().toISOString(),
          refreshed: true,
          message: "Supabase 연동이 비활성화되었습니다. Notion API만 사용합니다.",
        }
      } catch (error) {
        console.error("fetchProjectsData 오류:", error)
        return {
          results: [],
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          refreshed: false,
        }
      }
    },
    { forceRefresh, expiryMs: 0 }, // 캐시 만료 시간을 0으로 설정하여 항상 새로고침
  )
}

// 테이블 존재 여부 확인 함수 (더미 함수로 대체)
export async function checkProjectsTable() {
  console.warn("Supabase 연동이 비활성화되었습니다.")
  return {
    exists: false,
    error: "Supabase 연동이 비활성화되었습니다.",
  }
}

// 테이블 생성 SQL을 반환하는 함수 (더미 함수로 대체)
export async function getCreateProjectsTableSQL() {
  console.warn("Supabase 연동이 비활성화되었습니다.")
  return ""
}
