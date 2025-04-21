"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react"

export default function DirectDebugPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // 캐시 초기화 함수
  const clearCache = () => {
    // 로컬 스토리지에서 Notion 관련 캐시 항목 삭제
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("notion-data")) {
        localStorage.removeItem(key)
      }
    })
    alert("Notion 데이터 캐시가 초기화되었습니다. 페이지를 새로고침하세요.")
  }

  // Notion API 디버그 데이터 가져오기
  const fetchDebugData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/test-notion-debug")
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API 오류 (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      setData(result)
      setLastUpdated(new Date().toLocaleString("ko-KR"))
      console.log("Notion 디버그 데이터:", result)
    } catch (err) {
      setError(`데이터 가져오기 오류: ${err instanceof Error ? err.message : String(err)}`)
      console.error("디버그 데이터 가져오기 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  // 속성 값 렌더링 함수
  const renderPropertyValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>
    }

    if (typeof value === "object") {
      return (
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">{JSON.stringify(value, null, 2)}</pre>
      )
    }

    if (typeof value === "boolean") {
      return value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-gray-300" />
    }

    return <span>{String(value)}</span>
  }

  // 속성 타입에 따른 배지 색상
  const getPropertyTypeBadge = (type: string) => {
    switch (type) {
      case "select":
        return <Badge className="bg-blue-100 text-blue-800">select</Badge>
      case "multi_select":
        return <Badge className="bg-purple-100 text-purple-800">multi_select</Badge>
      case "rich_text":
        return <Badge className="bg-green-100 text-green-800">rich_text</Badge>
      case "title":
        return <Badge className="bg-yellow-100 text-yellow-800">title</Badge>
      case "date":
        return <Badge className="bg-red-100 text-red-800">date</Badge>
      case "checkbox":
        return <Badge className="bg-indigo-100 text-indigo-800">checkbox</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>
    }
  }

  // 속성 이름에 "stage" 또는 "단계"가 포함되어 있는지 확인
  const isStageProperty = (propertyName: string) => {
    const lowerName = propertyName.toLowerCase()
    return lowerName === "stage" || lowerName === "단계" || lowerName.includes("stage") || lowerName.includes("단계")
  }

  // 모든 속성 이름을 검색하여 "stage" 또는 "단계"와 유사한 속성 찾기
  const findSimilarStageProperties = (properties: string[]) => {
    return properties.filter((prop) => {
      const lowerProp = prop.toLowerCase()
      return (
        lowerProp.includes("stage") ||
        lowerProp.includes("단계") ||
        lowerProp.includes("상태") ||
        lowerProp.includes("status") ||
        lowerProp.includes("phase") ||
        lowerProp.includes("step")
      )
    })
  }

  // 속성 이름 검색 함수
  const searchPropertyNames = (properties: string[], searchTerm: string) => {
    if (!searchTerm) return properties
    const lowerSearchTerm = searchTerm.toLowerCase()
    return properties.filter((prop) => prop.toLowerCase().includes(lowerSearchTerm))
  }

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notion API 디버깅 페이지</h1>
      <p className="text-gray-600 mb-8">
        이 페이지는 Notion API 연결 및 데이터 구조를 디버깅하기 위한 도구입니다. 특히 "단계" 또는 "stage" 속성을 찾는데
        도움이 됩니다.
      </p>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={fetchDebugData} className="bg-[#a5a6f6] hover:bg-[#8384f3] text-white" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              데이터 가져오는 중...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Notion 데이터 디버깅
            </>
          )}
        </Button>

        <Button onClick={clearCache} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
          캐시 초기화
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-600 font-medium">오류 발생</h3>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      )}

      {data && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="properties">속성 목록</TabsTrigger>
            <TabsTrigger value="stage-analysis">Stage 속성 분석</TabsTrigger>
            <TabsTrigger value="raw-data">원본 데이터</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Notion 데이터 개요</CardTitle>
                <CardDescription>{lastUpdated && `최근 업데이트: ${lastUpdated}`}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">항목 수</span>
                    <span>{data.count}개</span>
                  </div>
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">속성 수</span>
                    <span>{data.properties?.length}개</span>
                  </div>
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Stage 관련 속성</span>
                    <span>
                      {findSimilarStageProperties(data.properties || []).length > 0
                        ? findSimilarStageProperties(data.properties || []).join(", ")
                        : "없음"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">{data.success ? "API 호출 성공" : "API 호출 실패"}</p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>데이터베이스 속성 목록</CardTitle>
                <CardDescription>Notion 데이터베이스에 있는 모든 속성 목록입니다.</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="속성 이름 검색..."
                    className="pl-10 pr-4 py-2 w-full border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {searchPropertyNames(data.properties || [], searchTerm).map((prop, index) => (
                    <div
                      key={index}
                      className={`flex justify-between p-3 rounded-lg ${
                        isStageProperty(prop) ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">
                        {prop}
                        {isStageProperty(prop) && (
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800">Stage 관련</Badge>
                        )}
                      </span>
                      {data.firstItemProperties && data.firstItemProperties[prop] && (
                        <span>{getPropertyTypeBadge(data.firstItemProperties[prop].type)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stage-analysis">
            <Card>
              <CardHeader>
                <CardTitle>Stage 속성 분석</CardTitle>
                <CardDescription>각 항목의 "stage" 또는 "단계" 속성 분석 결과입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.stagePropertyInfo && data.stagePropertyInfo.length > 0 ? (
                  <div className="space-y-6">
                    {data.stagePropertyInfo.map((info, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">항목 ID: {info.itemId}</h3>
                            {info.error ? (
                              <Badge className="bg-red-100 text-red-800">오류</Badge>
                            ) : info.hasSelectName ? (
                              <Badge className="bg-green-100 text-green-800">값 있음</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">값 없음</Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          {info.error ? (
                            <div className="text-red-600">
                              <p className="font-medium">오류: {info.error}</p>
                              <p className="mt-2">사용 가능한 속성:</p>
                              <ul className="list-disc list-inside mt-1">
                                {info.availableProperties.map((prop, i) => (
                                  <li key={i}>{prop}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">속성 이름</p>
                                  <p className="font-medium">{info.propertyName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">속성 타입</p>
                                  <p>{getPropertyTypeBadge(info.propertyType)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">추출된 값</p>
                                  <p className="font-medium">
                                    {info.extractedValue ? (
                                      info.extractedValue
                                    ) : (
                                      <span className="text-gray-400">없음</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">원본 데이터</p>
                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(info.rawData, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">분석할 데이터가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raw-data">
            <Card>
              <CardHeader>
                <CardTitle>원본 데이터</CardTitle>
                <CardDescription>Notion API에서 반환된 원본 데이터입니다. (최대 3개 항목)</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
                  {JSON.stringify(data.rawResults || data.sample, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">"Notion 데이터 디버깅" 버튼을 클릭하여 데이터를 가져오세요.</p>
        </div>
      )}
    </div>
  )
}
