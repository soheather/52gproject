"use client"

import { useState, useEffect } from "react"
import { processNotionData } from "@/lib/process-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusDonutChart } from "./status-donut-chart"
import { MetricsBarChart } from "./metrics-bar-chart"
import { POBarChart } from "./po-bar-chart"
import { SWBarChart } from "./sw-bar-chart"
import { MakeStackedChart } from "./make-stacked-chart"
import { Loader2, BarChart3, LineChart, Bell, Users, Code, Layers, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchNotionData } from "@/app/actions/notion"
import { MockDashboard } from "./mock-dashboard"

// Import the COLORS constant from StatusDonutChart
import { COLORS as DONUT_COLORS } from "./status-donut-chart"

export default function Dashboard({ notionData }: { notionData: any }) {
  const [processedData, setProcessedData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [makeData, setMakeData] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // 데이터 새로고침 함수
  const refreshData = async () => {
    try {
      setRefreshing(true)
      console.log("데이터 새로고침 시작...")

      const freshData = await fetchNotionData({
        forceRefresh: true,
        databaseId: process.env.NOTION_DATABASE_ID_SERVICES,
      })

      if (freshData.error) {
        setError(`데이터 새로고침 오류: ${freshData.error}`)
        return
      }

      // 새로운 데이터로 상태 업데이트
      processDataAndUpdate(freshData)
      setError(null)
    } catch (err) {
      console.error("데이터 새로고침 오류:", err)
      setError(`데이터 새로고침 오류: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setRefreshing(false)
    }
  }

  // 데이터 처리 및 상태 업데이트 함수
  const processDataAndUpdate = (data: any) => {
    try {
      if (!data || !data.results) {
        setError("Notion 데이터를 불러올 수 없습니다. 환경 변수 설정을 확인해주세요.")
        setProcessedData({
          statusData: [],
          metricsData: [],
          metricsMonitoringData: [],
          monitoringData: [],
          poData: [],
          swData: [],
          totalCount: 0,
          activeCount: 0,
          metricsCount: 0,
          assignedCount: 0,
        })
        setMakeData([])
        return
      }

      // Notion API 응답 데이터 처리
      const processedResult = processNotionData(data)
      setProcessedData(processedResult)

      // Make 데이터 추출
      if (data && data.results) {
        const extractedMakeData = data.results.map((item: any) => {
          return {
            id: item.id,
            make: getPropertyValue(item, "Make") || "미지정",
          }
        })
        setMakeData(extractedMakeData)
      }
    } catch (err) {
      console.error("데이터 처리 오류:", err)
      setError("데이터 처리 중 오류가 발생했습니다: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  useEffect(() => {
    try {
      setLoading(true)

      // Notion API 오류 확인
      if (notionData?.error) {
        setError(`Notion API 오류: ${notionData.error}`)
        setLoading(false)
        return
      }

      // 데이터 처리 및 상태 업데이트
      processDataAndUpdate(notionData)
    } catch (err) {
      console.error("데이터 처리 오류:", err)
      setError("데이터 처리 중 오류가 발생했습니다: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }, [notionData])

  // 속성값 추출 헬퍼 함수
  function getPropertyValue(item: any, propertyName: string): string | null {
    try {
      if (!item || !item.properties || !item.properties[propertyName]) {
        return null
      }

      const property = item.properties[propertyName]

      // 속성 타입에 따라 값 추출
      switch (property.type) {
        case "select":
          return translateYesNo(property.select?.name) || null
        case "multi_select":
          return translateYesNo(property.multi_select?.[0]?.name) || null
        case "rich_text":
          return translateYesNo(property.rich_text?.[0]?.plain_text) || null
        case "title":
          return translateYesNo(property.title?.[0]?.plain_text) || null
        case "people":
          return translateYesNo(property.people?.[0]?.name) || null
        case "checkbox":
          return property.checkbox ? "있음" : "없음"
        case "date":
          return property.date?.start || null
        case "url":
          return property.url || null
        default:
          return null
      }
    } catch (error) {
      console.error(`${propertyName} 속성 추출 오류:`, error)
      return null
    }
  }

  // Yes/No 값을 한글로 변환하는 헬퍼 함수
  function translateYesNo(value: string | null | undefined): string | null | undefined {
    if (!value) return value

    if (value.toLowerCase() === "yes") return "있음"
    if (value.toLowerCase() === "no") return "없음"

    return value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
        <span className="ml-2 text-[#6e6e85]">데이터 로딩 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
          <h3 className="text-[#c44f6a] text-lg font-medium">Notion API 연동 오류</h3>
        </div>
        <p className="text-[#c44f6a] mb-4">{error}</p>
        <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
          <p className="font-medium mb-2">다음 사항을 확인해보세요:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              환경 변수 <code className="bg-[#ffc2d1] px-1 rounded">NOTION_API_KEY</code>와{" "}
              <code className="bg-[#ffc2d1] px-1 rounded">NOTION_DATABASE_ID_PROJECTS</code>가 올바르게 설정되었는지
              확인하세요.
            </li>
            <li>키 값에 따옴표나 불필요한 공백이 포함되어 있지 않은지 확인하세요.</li>
            <li>Notion API 키가 유효하고 데이터베이스에 접근 권한이 있는지 확인하세요.</li>
            <li>
              서버를 재시작해보세요 (<code className="bg-[#ffc2d1] px-1 rounded">npm run dev</code>).
            </li>
            <li>
              테스트 엔드포인트(<code className="bg-[#ffc2d1] px-1 rounded">/api/test-notion</code>)에 접속하여 자세한
              오류 정보를 확인하세요.
            </li>
          </ul>
        </div>
        <div className="mt-6">
          <h4 className="font-medium text-[#c44f6a] mb-2">샘플 데이터 보기</h4>
          <p className="text-[#c44f6a] text-sm mb-4">API 연결 문제가 해결될 때까지 샘플 데이터를 확인할 수 있습니다.</p>
          <Button
            onClick={refreshData}
            className="mt-2 bg-[#a5a6f6] hover:bg-[#8384f3] text-white"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                새로고침 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                데이터 새로고침
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 border-t border-[#ffc2d1] pt-6">
          <MockDashboard onRefresh={refreshData} />
        </div>
      </div>
    )
  }

  if (!processedData || !processedData.statusData || processedData.statusData.length === 0) {
    return (
      <div className="bg-[#fff2c4] border border-[#ffe7a0] rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-[#a17f22] mr-2" />
          <h3 className="text-[#a17f22] text-lg font-medium">데이터가 없습니다</h3>
        </div>
        <p className="text-[#a17f22] mb-4">
          Notion 데이터베이스에서 데이터를 가져왔지만 표시할 데이터가 없습니다. 데이터베이스에 항목이 있는지 확인하거나
          다시 시도해보세요.
        </p>
        <Button onClick={refreshData} disabled={refreshing} className="mt-2 bg-[#a5a6f6] hover:bg-[#8384f3] text-white">
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              새로고침 중...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              데이터 새로고침
            </>
          )}
        </Button>

        <div className="mt-8 border-t border-[#ffe7a0] pt-6">
          <MockDashboard onRefresh={refreshData} />
        </div>
      </div>
    )
  }

  // 도넛 차트 범례 데이터 생성
  const legendItems = processedData.statusData.map((item: any, index: number) => {
    return {
      name: item.name,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
    }
  })

  return (
    <div className="space-y-6">
      {/* 새로고침 버튼 */}
      <div className="flex justify-end">
        <Button onClick={refreshData} disabled={refreshing} className="bg-[#a5a6f6] hover:bg-[#8384f3] text-white">
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              새로고침 중...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              데이터 새로고침
            </>
          )}
        </Button>
      </div>

      {/* 디지털 서비스 운영 현황을 상단에 크게 배치 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#a5a6f6]" />
            <h2 className="text-xl font-bold text-[#2d2d3d]">디지털 서비스 운영 현황</h2>
          </div>
        </div>

        {/* 범례를 세로로 정렬 */}
        <div className="flex md:flex-row">
          <div className="flex flex-col gap-2 mb-4 mr-8">
            {legendItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-[#6e6e85]">{item.name === "사용" ? "사용중" : item.name}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 h-[350px]">
            <StatusDonutChart data={processedData.statusData} />
          </div>
        </div>
      </div>

      {/* 서비스 구현 방식 차트 추가 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#a5a6f6]" />
            <h2 className="text-xl font-bold text-[#2d2d3d]">서비스 구현 방식</h2>
          </div>
        </div>
        <MakeStackedChart data={makeData} />
      </div>

      {/* 탭 인터페이스 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-[#f8f8fc] p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2d2d3d] data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="metrics"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2d2d3d] data-[state=active]:shadow-sm"
          >
            사용성 지표
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#2d2d3d] data-[state=active]:shadow-sm"
          >
            담당자 현황
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[#a5a6f6]" />
                  <h3 className="text-lg font-bold text-[#2d2d3d]">사용성 지표 유무 현황</h3>
                </div>
              </div>
              <div className="w-full h-[250px] flex justify-start">
                <MetricsBarChart data={processedData.metricsData} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#a5a6f6]" />
                  <h3 className="text-lg font-bold text-[#2d2d3d]">모니터링 진행 여부</h3>
                </div>
              </div>
              <div className="w-full h-[250px] flex justify-start">
                <MetricsBarChart data={processedData.monitoringData || []} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#a5a6f6]" />
                <h3 className="text-lg font-bold text-[#2d2d3d]">PO(서비스 담당자) 배정 현황</h3>
              </div>
            </div>
            <div className="w-full h-[250px] flex justify-start">
              <POBarChart data={processedData.poData} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-[#a5a6f6]" />
                <h3 className="text-lg font-bold text-[#2d2d3d]">SW 유지보수 담당자 현황</h3>
              </div>
            </div>
            <div className="w-full h-[250px] flex justify-start">
              <SWBarChart data={processedData.swData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[#a5a6f6]" />
                  <h3 className="text-lg font-bold text-[#2d2d3d]">사용성 지표 유무 현황</h3>
                </div>
              </div>
              <div className="h-[300px] flex justify-start">
                <MetricsBarChart data={processedData.metricsData} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#a5a6f6]" />
                  <h3 className="text-lg font-bold text-[#2d2d3d]">모니터링 진행 여부</h3>
                </div>
              </div>
              <div className="h-[300px] flex justify-start">
                <MetricsBarChart data={processedData.monitoringData || []} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#a5a6f6]" />
                  <h3 className="text-lg font-bold text-[#2d2d3d]">PO(서비스 담당자) 배정 현황</h3>
                </div>
              </div>
              <div className="h-[300px] flex justify-start">
                <POBarChart data={processedData.poData} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-[#a5a6f6]" />
                  <h3 className="text-lg font-bold text-[#2d2d3d]">SW 유지보수 담당자 현황</h3>
                </div>
              </div>
              <div className="h-[300px] flex justify-start">
                <SWBarChart data={processedData.swData} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-[#6e6e85] mt-8">
        마지막 업데이트: {new Date().toLocaleString("ko-KR")}
      </div>
    </div>
  )
}
