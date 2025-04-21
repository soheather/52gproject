import { fetchNotionData } from "@/app/actions/notion"
import ProjectsList2025 from "@/components/projects-list-2025"
import { Suspense } from "react"
import Loading from "./loading"
import { AlertTriangle } from "lucide-react"
// 상단에 RefreshProjectsButton import 추가
import { RefreshProjectsButton } from "@/components/refresh-projects-button"

export const dynamic = "force-dynamic"
export const revalidate = 0 // 항상 최신 데이터 가져오기

export default async function ProjectsPage() {
  try {
    // 환경변수 검증
    const projectsDbId = process.env.NOTION_DATABASE_ID_PROJECTS

    if (!projectsDbId) {
      console.error("❌ NOTION_DATABASE_ID_PROJECTS 환경변수가 설정되지 않았습니다.")
      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">2025 프로젝트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">Notion API 기반 실시간 대시보드</p>
            </div>
            <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
                <h3 className="text-[#c44f6a] text-lg font-medium">환경변수 오류</h3>
              </div>
              <p className="text-[#c44f6a] mb-4">
                NOTION_DATABASE_ID_PROJECTS 환경변수가 설정되지 않았습니다. .env.local 파일에 환경변수를 추가하고 서버를
                재시작해주세요.
              </p>
              <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
                <p className="font-medium mb-2">다음과 같이 환경변수를 설정해주세요:</p>
                <pre className="bg-[#ffc2d1] bg-opacity-30 p-2 rounded overflow-x-auto">
                  NOTION_DATABASE_ID_PROJECTS=your_database_id_here
                </pre>
              </div>
            </div>
          </div>
        </main>
      )
    }

    console.log(`🔍 프로젝트 페이지 로딩 - 데이터베이스 ID: ${projectsDbId.substring(0, 5)}...`)

    // 서버 컴포넌트에서 Notion 데이터 가져오기 (NOTION_DATABASE_ID_PROJECTS 사용)
    const notionData = await fetchNotionData({
      databaseId: projectsDbId,
      forceRefresh: true,
    })

    // Notion API 오류 확인
    if (notionData?.error) {
      console.error(`❌ Notion API 오류: ${notionData.error}`)
      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">2025 프로젝트 리스트</h1>
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
                    <code className="bg-[#ffc2d1] px-1 rounded">NOTION_DATABASE_ID_PROJECTS</code>가 올바르게
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

    console.log(`✅ 프로젝트 데이터 로드 완료: ${notionData.results?.length || 0}개 항목`)

    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#2d2d3d]">2025 프로젝트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">Notion API 기반 실시간 대시보드</p>
            </div>
            <RefreshProjectsButton />
          </div>
          <Suspense fallback={<Loading />}>
            <ProjectsList2025 notionData={notionData} />
          </Suspense>
        </div>
      </main>
    )
  } catch (error) {
    console.error("Projects page error:", error)
    // 오류 발생 시 기본 UI 표시
    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">2025 프로젝트 리스트</h1>
            <p className="text-[#6e6e85] mt-1">Notion API 기반 실시간 대시보드</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-[#6e6e85] py-12">
              데이터를 불러오는 중 오류가 발생했습니다: {error instanceof Error ? error.message : String(error)}
            </p>
            <p className="text-[#6e6e85]">잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </main>
    )
  }
}
