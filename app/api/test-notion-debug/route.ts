import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 환경 변수 가져오기
    const apiKey = process.env.NOTION_API_KEY
    const databaseId = process.env.NOTION_DATABASE_ID_PROJECTS // 프로젝트 데이터베이스 ID 사용

    // 환경 변수 유효성 검사
    if (!apiKey) {
      return NextResponse.json({ error: "NOTION_API_KEY가 없습니다" }, { status: 500 })
    }

    if (!databaseId) {
      return NextResponse.json({ error: "NOTION_DATABASE_ID_PROJECTS가 없습니다" }, { status: 500 })
    }

    console.log(`Notion API 디버그 테스트 시작 - 데이터베이스 ID: ${databaseId}`)

    // Notion API 직접 호출
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 5, // 테스트를 위해 5개만 가져옴
      }),
      cache: "no-store", // 항상 최신 데이터 가져오기
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Notion API 오류 (${response.status}): ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // 데이터베이스 속성 정보 추출
    const properties = data.results.length > 0 ? Object.keys(data.results[0].properties) : []

    // 첫 번째 항목의 모든 속성 상세 정보 추출
    const firstItemProperties = {}
    if (data.results.length > 0) {
      const firstItem = data.results[0]
      for (const key in firstItem.properties) {
        firstItemProperties[key] = {
          type: firstItem.properties[key].type,
          rawData: firstItem.properties[key],
          value: extractPropertyValue(firstItem.properties[key]),
        }
      }
    }

    // 모든 항목의 "stage" 속성 정보 추출 (대소문자 구분 없이)
    const stagePropertyInfo = []
    if (data.results.length > 0) {
      for (let i = 0; i < data.results.length; i++) {
        const item = data.results[i]

        // 새로운 방식으로 단계 속성 찾기
        const stageEntry = Object.entries(item.properties).find(
          ([key]) => key === "단계" || key.toLowerCase() === "stage",
        )

        if (stageEntry) {
          const [propertyName, propertyValue] = stageEntry
          stagePropertyInfo.push({
            itemId: item.id,
            propertyName,
            propertyType: propertyValue.type,
            rawData: propertyValue,
            extractedValue: propertyValue.type === "select" ? propertyValue.select?.name : null,
            hasSelectName: propertyValue.type === "select" && !!propertyValue.select?.name,
            selectName: propertyValue.type === "select" ? propertyValue.select?.name : null,
          })
        } else {
          stagePropertyInfo.push({
            itemId: item.id,
            error: "stage 또는 단계 속성을 찾을 수 없음",
            availableProperties: Object.keys(item.properties),
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: data.results.length,
      properties,
      firstItemProperties,
      stagePropertyInfo,
      sample: data.results.length > 0 ? data.results[0] : null,
      // 원본 데이터 전체를 포함 (최대 3개 항목만)
      rawResults: data.results.slice(0, 3).map((item) => ({
        id: item.id,
        properties: Object.fromEntries(
          Object.entries(item.properties).map(([key, value]) => {
            // 속성 이름을 소문자로 변환하여 비교
            const lowerKey = key.toLowerCase()
            // stage 또는 단계 관련 속성에 표시 추가
            const isStageRelated = lowerKey === "stage" || lowerKey === "단계"
            return [key + (isStageRelated ? " (STAGE 관련)" : ""), value]
          }),
        ),
      })),
    })
  } catch (error) {
    console.error("Notion API 디버그 테스트 오류:", error)
    return NextResponse.json(
      { error: `Notion API 디버그 테스트 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

// 속성 값 추출 헬퍼 함수
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
