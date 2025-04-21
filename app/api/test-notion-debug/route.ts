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

        // stage 속성 직접 확인 (정확히 "stage"라는 이름으로)
        if (item.properties["stage"]) {
          const stageProperty = item.properties["stage"]
          stagePropertyInfo.push({
            itemId: item.id,
            propertyName: "stage",
            propertyType: stageProperty.type,
            rawData: stageProperty,
            extractedValue: extractPropertyValue(stageProperty),
            hasSelectName: stageProperty.type === "select" && !!stageProperty.select?.name,
            selectName: stageProperty.type === "select" ? stageProperty.select?.name : null,
          })
        }
        // 단계 속성 확인 (정확히 "단계"라는 이름으로)
        else if (item.properties["단계"]) {
          const stageProperty = item.properties["단계"]
          stagePropertyInfo.push({
            itemId: item.id,
            propertyName: "단계",
            propertyType: stageProperty.type,
            rawData: stageProperty,
            extractedValue: extractPropertyValue(stageProperty),
            hasSelectName: stageProperty.type === "select" && !!stageProperty.select?.name,
            selectName: stageProperty.type === "select" ? stageProperty.select?.name : null,
          })
        }
        // 대소문자 구분 없이 "stage" 또는 "단계"와 일치하는 속성 찾기
        else {
          const stagePropertyName = Object.keys(item.properties).find(
            (key) => key.toLowerCase() === "stage" || key.toLowerCase() === "단계",
          )

          if (stagePropertyName) {
            const stageProperty = item.properties[stagePropertyName]
            stagePropertyInfo.push({
              itemId: item.id,
              propertyName: stagePropertyName,
              propertyType: stageProperty.type,
              rawData: stageProperty,
              extractedValue: extractPropertyValue(stageProperty),
              hasSelectName: stageProperty.type === "select" && !!stageProperty.select?.name,
              selectName: stageProperty.type === "select" ? stageProperty.select?.name : null,
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
    }

    return NextResponse.json({
      success: true,
      count: data.results.length,
      properties,
      firstItemProperties,
      stagePropertyInfo,
      sample: data.results.length > 0 ? data.results[0] : null,
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
