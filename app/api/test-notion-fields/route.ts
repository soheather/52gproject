import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const url = new URL(request.url)
    const dbId = url.searchParams.get("dbId") || process.env.NOTION_DATABASE_ID_PROJECTS

    // 환경 변수 가져오기
    const apiKey = process.env.NOTION_API_KEY

    // 환경 변수 유효성 검사
    if (!apiKey) {
      return NextResponse.json({ error: "NOTION_API_KEY가 없습니다" }, { status: 500 })
    }

    if (!dbId) {
      return NextResponse.json({ error: "데이터베이스 ID가 없습니다" }, { status: 500 })
    }

    console.log(`Notion API 테스트 - 데이터베이스 ID: ${dbId}`)

    // Notion API 직접 호출
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
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

    // 속성 상세 정보 추출
    const propertyDetails = {}
    if (data.results.length > 0) {
      const firstItem = data.results[0]
      for (const key in firstItem.properties) {
        propertyDetails[key] = {
          type: firstItem.properties[key].type,
          value: extractPropertyValue(firstItem.properties[key]),
          rawData: firstItem.properties[key],
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: data.results.length,
      properties,
      propertyDetails,
      sample: data.results.length > 0 ? data.results[0] : null,
      allItems: data.results.map((item) => ({
        id: item.id,
        properties: Object.keys(item.properties).reduce((acc, key) => {
          acc[key] = {
            type: item.properties[key].type,
            value: extractPropertyValue(item.properties[key]),
          }
          return acc
        }, {}),
      })),
    })
  } catch (error) {
    console.error("Notion API 테스트 오류:", error)
    return NextResponse.json(
      { error: `Notion API 테스트 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

// 속성 값 추출 헬퍼 함수
function extractPropertyValue(property) {
  try {
    switch (property.type) {
      case "select":
        return property.select?.name || null
      case "multi_select":
        return property.multi_select?.map((item) => item.name) || []
      case "rich_text":
        return property.rich_text?.map((item) => item.plain_text).join("") || null
      case "title":
        return property.title?.map((item) => item.plain_text).join("") || null
      case "people":
        return property.people?.map((person) => person.name) || []
      case "date":
        return property.date?.start || null
      case "url":
        return property.url || null
      case "checkbox":
        return property.checkbox
      case "number":
        return property.number
      case "email":
        return property.email
      case "phone_number":
        return property.phone_number
      case "formula":
        return extractPropertyValue({
          type: property.formula.type,
          [property.formula.type]: property.formula[property.formula.type],
        })
      case "relation":
        return property.relation?.map((item) => item.id) || []
      case "rollup":
        return property.rollup?.array?.map((item) => extractPropertyValue(item)) || []
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
    console.error(`속성 추출 오류 (${property.type}):`, error)
    return null
  }
}
