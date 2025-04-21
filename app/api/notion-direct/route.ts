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

    console.log(`Notion API 직접 호출 시작 - 데이터베이스 ID: ${databaseId}`)

    // Notion API 직접 호출
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 10, // 테스트를 위해 10개만 가져옴
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

    // 결과 처리 및 분석
    const processedResults = []

    if (data.results && data.results.length > 0) {
      for (const item of data.results) {
        // 모든 속성 이름 출력
        const propertyNames = Object.keys(item.properties)

        // stage 속성 찾기 (정확히 'stage'라는 이름으로)
        const stageProperty = item.properties.stage

        // 제목 속성 찾기
        const titleProperty = findPropertyByType(item.properties, "title")
        const title = titleProperty ? extractTextFromRichText(titleProperty) : "제목 없음"

        processedResults.push({
          id: item.id,
          title,
          propertyNames,
          hasStageProperty: !!stageProperty,
          stagePropertyType: stageProperty ? stageProperty.type : null,
          stageValue: stageProperty ? extractPropertyValue(stageProperty) : null,
          rawProperties: item.properties,
        })
      }
    }

    return NextResponse.json({
      success: true,
      count: data.results?.length || 0,
      processedResults,
      firstItem: data.results?.length > 0 ? data.results[0] : null,
    })
  } catch (error) {
    console.error("Notion API 직접 호출 오류:", error)
    return NextResponse.json(
      { error: `Notion API 직접 호출 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

// 특정 타입의 속성 찾기
function findPropertyByType(properties, type) {
  for (const key in properties) {
    if (properties[key].type === type) {
      return properties[key]
    }
  }
  return null
}

// 리치 텍스트에서 텍스트 추출
function extractTextFromRichText(property) {
  if (property.type === "title") {
    return property.title.map((item) => item.plain_text).join("")
  }
  if (property.type === "rich_text") {
    return property.rich_text.map((item) => item.plain_text).join("")
  }
  return null
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
      default:
        return null
    }
  } catch (error) {
    console.error(`속성 추출 오류 (${property?.type}):`, error)
    return null
  }
}
