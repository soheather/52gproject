import { fetchNotionData } from "@/app/actions/notion"
import ServicesList from "@/components/services-list"
import { AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 300 // 5분마다 재검증

export default async function ServicesPage() {
  try {
    // 환경변수 검증
    const servicesDbId = process.env.NOTION_DATABASE_ID_SERVICES
    const apiKey = process.env.NOTION_API_KEY

    if (!apiKey || !servicesDbId) {
      console.error("❌ 필요한 환경변수가 설정되지 않았습니다.")
      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 프로덕트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">디지털 프로덕트 데이터베이스와 실시간 동기화</p>
            </div>
            <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
                <h3 className="text-[#c44f6a] text-lg font-medium">환경변수 오류</h3>
              </div>
              <p className="text-[#c44f6a] mb-4">
                {!apiKey ? "NOTION_API_KEY" : "NOTION_DATABASE_ID_SERVICES"} 환경변수가 설정되지 않았습니다. .env.local
                파일에 환경변수를 추가하고 서버를 재시작해주세요.
              </p>
              <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
                <p className="font-medium mb-2">다음과 같이 환경변수를 설정해주세요:</p>
                <pre className="bg-[#ffc2d1] bg-opacity-30 p-2 rounded overflow-x-auto">
                  NOTION_API_KEY=your_api_key_here NOTION_DATABASE_ID_SERVICES=your_database_id_here
                </pre>
              </div>
            </div>

            {/* Show mock data or placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="text-lg font-medium text-[#4b4b63] mb-4">샘플 서비스 데이터</h3>
              <p className="text-[#6e6e85] mb-6">환경 변수가 설정되지 않아 샘플 데이터를 표시합니다.</p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#f8f8fc]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider">
                        서비스명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider">
                        회사
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider">
                        PO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider">
                        SW
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-[#f8f8fc]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">
                        디지털 서비스 대시보드
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">사용</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">52g</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">홍길동</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">사내IT팀</td>
                    </tr>
                    <tr className="hover:bg-[#f8f8fc]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">
                        모바일 앱 서비스
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">개발중</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">파트너사</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">김철수</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">파트너</td>
                    </tr>
                    <tr className="hover:bg-[#f8f8fc]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">
                        데이터 분석 플랫폼
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="bg-[#ffd6e0] text-[#c44f6a] rounded-full font-medium px-3 py-1">미사용</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">사내IT팀</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">없음</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">사내IT팀</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      )
    }

    // 서버 컴포넌트에서 Notion 데이터 가져오기 (NOTION_DATABASE_ID_SERVICES 사용)
    const notionData = await fetchNotionData({
      databaseId: servicesDbId,
      forceRefresh: true,
    })

    // Notion API 오류 확인
    if (notionData?.error) {
      return (
        <main className="py-8 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 프로덕트 리스트</h1>
              <p className="text-[#6e6e85] mt-1">디지털 프로덕트 데이터베이스와 실시간 동기화</p>
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

    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 프로덕트 리스트</h1>
            <p className="text-[#6e6e85] mt-1">디지털 프로덕트 데이터베이스와 실시간 동기화</p>
          </div>
          <ServicesList notionData={notionData} />
        </div>
      </main>
    )
  } catch (error) {
    console.error("Services page error:", error)
    // 오류 발생 시 기본 UI 표시
    return (
      <main className="py-8 px-6 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d2d3d]">디지털 프로덕트 리스트</h1>
            <p className="text-[#6e6e85] mt-1">디지털 프로덕트 데이터베이스와 실시간 동기화</p>
          </div>
          <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
              <h3 className="text-[#c44f6a] text-lg font-medium">오류 발생</h3>
            </div>
            <p className="text-[#c44f6a]">
              데이터를 불러오는 중 오류가 발생했습니다: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </main>
    )
  }
}
