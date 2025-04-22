"use server"

import { fetchWithCache } from "@/lib/cache-utils"

// 캐시 키
const NOTION_CACHE_KEY_PREFIX = "notion-data"

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

export async function fetchNotionData(options: { forceRefresh?: boolean; databaseId?: string }) {
  const { forceRefresh = false, databaseId } = options || {}

  // 환경변수 검증 강화
  const apiKey = process.env.NOTION_API_KEY
  const defaultDatabaseId = process.env.NOTION_DATABASE_ID_PROJECTS

  // Use provided databaseId or fall back to the default
  const targetDatabaseId = databaseId || defaultDatabaseId

  if (!apiKey) {
    console.error("❌ NOTION_API_KEY 환경변수가 설정되지 않았습니다.")
    return {
      results: [],
      error: "NOTION_API_KEY 환경변수가 설정되지 않았습니다. 환경변수를 확인해주세요.",
      useMockData: true, // Add flag to indicate mock data should be used
    }
  }

  if (!targetDatabaseId) {
    console.error("❌ 데이터베이스 ID가 제공되지 않았습니다.")
    return {
      results: [],
      error: "데이터베이스 ID가 제공되지 않았습니다. 올바른 데이터베이스 ID를 전달해주세요.",
      useMockData: true, // Add flag to indicate mock data should be used
    }
  }

  // 데이터베이스 ID에 따라 다른 캐시 키 사용
  const cacheKey = `${NOTION_CACHE_KEY_PREFIX}-${targetDatabaseId}`

  console.log(`📊 Notion API 호출 준비 - 데이터베이스 ID: ${targetDatabaseId.substring(0, 5)}...`)
  console.log(`🔑 API Key 설정됨: ${apiKey ? "✅" : "❌"}`)

  return fetchWithCache(
    cacheKey,
    async () => {
      try {
        console.log(`📊 Notion API 호출 시작 - 데이터베이스 ID: ${targetDatabaseId.substring(0, 5)}...`)

        // Implement retry mechanism
        let lastError = null
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            // Notion API 직접 호출 - 정렬 옵션 제거
            const response = await fetch(`https://api.notion.com/v1/databases/${targetDatabaseId}/query`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                page_size: 100,
                // 정렬 옵션은 제거 - 기본 정렬 사용
              }),
              cache: "no-store", // 항상 최신 데이터 가져오기
            })

            // 응답 상태 코드에 따른 오류 처리 강화
            if (!response.ok) {
              const errorText = await response.text()
              const statusCode = response.status

              let errorMessage = `Notion API 오류 (${statusCode}): ${errorText}`

              // 상태 코드별 더 명확한 오류 메시지
              if (statusCode === 401) {
                errorMessage = "Notion API 키가 유효하지 않습니다. 올바른 API 키를 설정해주세요."
              } else if (statusCode === 404) {
                errorMessage = `데이터베이스를 찾을 수 없습니다. 데이터베이스 ID(${targetDatabaseId.substring(0, 5)}...)가 올바른지 확인하고, 해당 데이터베이스에 접근 권한이 있는지 확인해주세요.`
              } else if (statusCode === 400) {
                errorMessage = `잘못된 요청입니다: ${errorText}. 요청 형식을 확인해주세요.`
              } else if (statusCode === 429) {
                errorMessage = "Notion API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
              }

              throw new Error(errorMessage)
            }

            const data = await response.json()
            console.log(`✅ Notion API 호출 성공: ${data.results?.length || 0}개의 결과`)

            // 결과가 없는 경우 로그 추가
            if (!data.results || data.results.length === 0) {
              console.log("⚠️ 주의: Notion API에서 결과가 반환되지 않았습니다.")
            }

            return {
              ...data,
              timestamp: new Date().toISOString(),
              databaseId: targetDatabaseId,
            }
          } catch (error) {
            lastError = error
            console.error(`❌ Notion API 호출 시도 ${attempt + 1}/${MAX_RETRIES} 실패:`, error)

            // Last attempt failed, don't wait
            if (attempt < MAX_RETRIES - 1) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (attempt + 1)))
            }
          }
        }

        // All retries failed
        throw lastError || new Error("Notion API 호출에 실패했습니다.")
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
    },
    { forceRefresh, expiryMs: 60000 }, // 캐시 시간을 1분으로 설정
  )
}

// 속성값 추출 헬퍼 함수
function extractPropertyValue(property) {
  try {
    if (!property) return null

    switch (property.type) {
      case "select":
        return property.select?.name || null
      case "multi_select":
        return property.multi_select?.map((item) => item.name).join(", ") || null
      case "rich_text":
        return property.rich_text?.map((item) => item.plain_text).join("") || null
      case "title":
        return property.title?.map((item) => item.plain_text).join("") || null
      case "people":
        return property.people?.map((person) => person.name).join(", ") || null
      case "date":
        return property.date?.start || null
      case "url":
        return property.url || null
      case "checkbox":
        return property.checkbox ? "Yes" : "No"
      case "number":
        return property.number?.toString() || null
      case "email":
        return property.email || null
      case "phone_number":
        return property.phone_number || null
      case "formula":
        if (property.formula.type === "string") {
          return property.formula.string || null
        }
        return null
      case "relation":
        return property.relation?.map((item) => item.id).join(", ") || null
      case "rollup":
        if (property.rollup.type === "array") {
          return property.rollup.array?.map((item) => extractPropertyValue(item)).join(", ") || null
        }
        return null
      case "created_time":
        return property.created_time
      case "created_by":
        return property.created_by?.name || null
      case "last_edited_time":
        return property.last_edited_time
      case "last_edited_by":
        return property.last_edited_by?.name || null
      default:
        return null
    }
  } catch (error) {
    console.error(`속성 추출 오류 (${property?.type}):`, error)
    return null
  }
}
