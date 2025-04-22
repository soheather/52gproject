import { fetchNotionData } from "@/app/actions/notion"
import ProjectsList2025 from "@/components/projects-list-2025"
import { Suspense } from "react"
import Loading from "./loading"
import { AlertTriangle, BarChart3, CheckCircle2, Clock, ListChecks } from "lucide-react"
// 상단에 RefreshProjectsButton import 추가
import { RefreshProjectsButton } from "@/components/refresh-projects-button"

export const dynamic = "force-dynamic"
export const revalidate = 0 // 항상 최신 데이터 가져오기

export default async function ProjectsPage() {
  try {
    // 환경변수 검증
    const projectsDbId = process.env.NOTION_DATABASE_ID_PROJECTS
    const apiKey = process.env.NOTION_API_KEY

    if (!apiKey || !projectsDbId) {
      console.error("❌ 필요한 환경변수가 설정되지 않았습니다.")
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
                {!apiKey ? "NOTION_API_KEY" : "NOTION_DATABASE_ID_PROJECTS"} 환경변수가 설정되지 않았습니다. .env.local
                파일에 환경변수를 추가하고 서버를 재시작해주세요.
              </p>
              <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
                <p className="font-medium mb-2">다음과 같이 환경변수를 설정해주세요:</p>
                <pre className="bg-[#ffc2d1] bg-opacity-30 p-2 rounded overflow-x-auto">
                  NOTION_API_KEY=your_api_key_here NOTION_DATABASE_ID_PROJECTS=your_database_id_here
                </pre>
              </div>
            </div>

            {/* Show mock data or placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="text-lg font-medium text-[#4b4b63] mb-4">샘플 프로젝트 데이터</h3>
              <p className="text-[#6e6e85] mb-6">환경 변수가 설정되지 않아 샘플 데이터를 표시합니다.</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-[#f0f0ff] p-3 mr-4">
                    <BarChart3 className="h-6 w-6 text-[#7b7bf7]" />
                  </div>
                  <div>
                    <p className="text-[#6e6e85] text-sm">전체 프로젝트</p>
                    <p className="text-2xl font-bold text-[#2d2d3d]">15개</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-[#fff2c4] bg-opacity-50 p-3 mr-4">
                    <Clock className="h-6 w-6 text-[#a17f22]" />
                  </div>
                  <div>
                    <p className="text-[#6e6e85] text-sm">진행보류/후보/확정</p>
                    <p className="text-2xl font-bold text-[#2d2d3d]">5개</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-[#c5e8ff] bg-opacity-50 p-3 mr-4">
                    <ListChecks className="h-6 w-6 text-[#3a6ea5]" />
                  </div>
                  <div>
                    <p className="text-[#6e6e85] text-sm">진행중</p>
                    <p className="text-2xl font-bold text-[#2d2d3d]">7개</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                  <div className="rounded-full bg-[#e1f5c4] bg-opacity-50 p-3 mr-4">
                    <CheckCircle2 className="h-6 w-6 text-[#5a7052]" />
                  </div>
                  <div>
                    <p className="text-[#6e6e85] text-sm">진행완료</p>
                    <p className="text-2xl font-bold text-[#2d2d3d]">3개</p>
                  </div>
                </div>
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

    if (notionData?.results) {
      console.log(`✅ 프로젝트 데이터 로드 완료: ${notionData.results.length}개 항목`)

      if (notionData.results.length > 0) {
        const firstItem = notionData.results[0]
        console.log("첫 번째 항목 속성 키:", Object.keys(firstItem.properties))

        // stage 관련 키 확인
        const stageKey = Object.keys(firstItem.properties).find(
          (key) =>
            key === "stage" ||
            key === "단계" ||
            key.toLowerCase().includes("stage") ||
            key.toLowerCase().includes("단계"),
        )

        if (stageKey) {
          console.log(`스테이지 키 발견: '${stageKey}'`, firstItem.properties[stageKey])
        } else {
          console.log("⚠️ 스테이지 관련 키를 찾을 수 없음")
        }
      }
    }

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
