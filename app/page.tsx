import { fetchNotionData } from "@/app/actions/notion"
import Dashboard from "@/components/dashboard"
import { Suspense } from "react"
import Loading from "./loading"
import { AlertTriangle } from "lucide-react"

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
      forceRefresh: false, // Changed to false to use cache when available
      databaseId: process.env.NOTION_DATABASE_ID_SERVICES, // 디지털 프로덕트 리스트와 동일한 DB 사용
    })

    // 오류 처리
    if (notionData.error) {
      console.error("Notion 데이터 가져오기 오류:", notionData.error)
      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 서비스 현황</h1>
              <p className="text-[#6e6e85] mt-1">Notion API 기반 실시간 대시보드</p>
            </div>
            <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
                <h3 className="text-[#c44f6a] text-lg font-medium">Notion API 연동 오류</h3>
              </div>
              <p className="text-[#c44f6a] mb-4">{notionData.error}</p>
              <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
                <p className="font-medium mb-2">다음 사항을 확인해보세요:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    환경 변수 <code className="bg-[#ffc2d1] px-1 rounded">NOTION_API_KEY</code>와{" "}
                    <code className="bg-[#ffc2d1] px-1 rounded">NOTION_DATABASE_ID_SERVICES</code>가 올바르게
                    설정되었는지 확인하세요.
                  </li>
                  <li>키 값에 따옴표나 불필요한 공백이 포함되어 있지 않은지 확인하세요.</li>
                  <li>Notion API 키가 유효하고 데이터베이스에 접근 권한이 있는지 확인하세요.</li>
                  <li>
                    서버를 재시작해보세요 (<code className="bg-[#ffc2d1] px-1 rounded">npm run dev</code>).
                  </li>
                  <li>
                    테스트 엔드포인트(<code className="bg-[#ffc2d1] px-1 rounded">/api/test-notion</code>)에 접속하여
                    자세한 오류 정보를 확인하세요.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      )
    }

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
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
              <h3 className="text-[#c44f6a] text-lg font-medium">오류 발생</h3>
            </div>
            <p className="text-[#6e6e85] py-4">데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
            <p className="text-[#6e6e85] text-sm">
              오류 내용: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </main>
    )
  }
}
