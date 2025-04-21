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

    // 단계 속성 정보 추출
    let stageInfo = null
    if (data.results.length > 0) {
      const firstItem = data.results[0]

      // 단계 속성 찾기 (대소문자 구분 없이)
      const stagePropertyName = properties.find(
        (prop) => prop.toLowerCase() === "단계" || prop.toLowerCase() === "stage",
      )

      if (stagePropertyName) {
        const stageProperty = firstItem.properties[stagePropertyName]
        stageInfo = {
          propertyName: stagePropertyName,
          propertyType: stageProperty.type,
          rawData: stageProperty,
          value: extractPropertyValue(stageProperty),
        }
      }
    }

    // 모든 항목의 단계 값 추출
    const stageValues = []
    if (data.results.length > 0) {
      for (const item of data.results) {
        // 단계 속성 찾기
        const stagePropertyName = Object.keys(item.properties).find(
          (prop) => prop.toLowerCase() === "단계" || prop.toLowerCase() === "stage",
        )

        if (stagePropertyName) {
          const stageProperty = item.properties[stagePropertyName]
          stageValues.push({
            id: item.id,
            title: extractTitle(item),
            stageProperty: stagePropertyName,
            stageType: stageProperty.type,
            stageValue: extractPropertyValue(stageProperty),
            rawData: stageProperty,
          })
        } else {
          stageValues.push({
            id: item.id,
            title: extractTitle(item),
            error: "단계 속성을 찾을 수 없음",
            availableProperties: Object.keys(item.properties),
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: data.results.length,
      properties,
      stageInfo,
      stageValues,
      firstItem:
        data.results.length > 0
          ? {
              id: data.results[0].id,
              properties: data.results[0].properties,
            }
          : null,
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
      default:
        return null
    }
  } catch (error) {
    console.error(`속성 추출 오류 (${property?.type}):`, error)
    return null
  }
}

// 제목 추출 함수
function extractTitle(item) {
  try {
    // 제목 속성 찾기
    const titlePropertyName = Object.keys(item.properties).find(
      (prop) => prop.toLowerCase() === "title" || prop.toLowerCase() === "이름" || prop.toLowerCase() === "name",
    )

    if (titlePropertyName) {
      const titleProperty = item.properties[titlePropertyName]
      if (titleProperty.type === "title") {
        return titleProperty.title?.map((item) => item.plain_text).join("") || "제목 없음"
      }
    }

    return "제목 없음"
  } catch (error) {
    console.error("제목 추출 오류:", error)
    return "제목 없음"
  }
}
