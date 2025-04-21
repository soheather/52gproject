import { fetchNotionData } from "@/app/actions/notion"
import Dashboard from "@/components/dashboard"
import { Suspense } from "react"
import Loading from "./loading"

export const dynamic = "force-dynamic"
export const revalidate = 0 // 항상 최신 데이터 가져오기

export default async function Home() {
  try {
    console.log("홈 페이지 렌더링 시작...")
    console.log("환경 변수 확인:")
    console.log("NOTION_API_KEY 설정됨:", !!process.env.NOTION_API_KEY)
    console.log("NOTION_DATABASE_ID_SERVICES 설정됨:", !!process.env.NOTION_DATABASE_ID_SERVICES)

    // 서비스 데이터베이스 ID를 사용하여 Notion 데이터 가져오기
    const notionData = await fetchNotionData({
      forceRefresh: true,
      databaseId: process.env.NOTION_DATABASE_ID_SERVICES, // 디지털 프로덕트 리스트와 동일한 DB 사용
    })

    console.log(
      "Notion 데이터 가져오기 완료:",
      notionData.results ? `${notionData.results.length}개 항목` : "결과 없음",
    )

    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 서비스 현황</h1>
            <p className="text-[#6e6e85] mt-1">Notion API 기반 실시간 대시보드</p>
          </div>
          <Suspense fallback={<Loading />}>
            <Dashboard notionData={notionData} />
          </Suspense>
        </div>
      </main>
    )
  } catch (error) {
    console.error("Home page error:", error)
    // 오류 발생 시 기본 UI 표시
    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 서비스 현황</h1>
            <p className="text-[#6e6e85] mt-1">Notion API 기반 실시간 대시보드</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-[#6e6e85] py-12">데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
            <p className="text-[#6e6e85] text-sm">
              오류 내용: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </main>
    )
  }
}
