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

    console.log(`Notion 데이터베이스 속성 이름 조회 시작 - 데이터베이스 ID: ${databaseId}`)

    // Notion API 직접 호출 - 데이터베이스 정보 가져오기
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
      },
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
    const properties = data.properties || {}

    // 속성 정보 정리
    const propertyDetails = Object.entries(properties).map(([name, details]) => {
      return {
        name,
        type: details.type,
        id: details.id,
        // select 타입인 경우 옵션 목록 추가
        options: details.type === "select" ? details.select?.options : undefined,
        // 기타 필요한 정보 추가
      }
    })

    // 특별히 "단계" 또는 "stage" 관련 속성 찾기
    const stageProperties = propertyDetails.filter(
      (prop) =>
        prop.name.toLowerCase() === "단계" ||
        prop.name.toLowerCase() === "stage" ||
        prop.name.toLowerCase().includes("단계") ||
        prop.name.toLowerCase().includes("stage"),
    )

    return NextResponse.json({
      success: true,
      databaseTitle: data.title?.[0]?.plain_text || "제목 없음",
      propertyCount: propertyDetails.length,
      properties: propertyDetails,
      stageProperties,
      // 전체 데이터베이스 정보도 포함
      databaseInfo: {
        id: data.id,
        title: data.title,
        description: data.description,
        created_time: data.created_time,
        last_edited_time: data.last_edited_time,
      },
    })
  } catch (error) {
    console.error("Notion 데이터베이스 속성 이름 조회 오류:", error)
    return NextResponse.json(
      { error: `Notion 데이터베이스 속성 이름 조회 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
