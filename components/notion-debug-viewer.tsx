"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Bug, Database } from "lucide-react"

export function NotionDebugViewer() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchDebugData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Notion 디버그 데이터 가져오는 중...")

      const response = await fetch("/api/notion-debug")
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("디버그 데이터 가져오기 성공:", result)
      setData(result)
    } catch (err) {
      console.error("디버그 데이터 가져오기 오류:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-[#a5a6f6]" />
          <h2 className="text-xl font-bold text-[#2d2d3d]">Notion API 디버그 도구</h2>
        </div>
        <Button onClick={handleFetchDebugData} disabled={loading} className="bg-[#a5a6f6] hover:bg-[#8384f3]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              로딩 중...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Notion 데이터 디버깅
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-4 text-[#c44f6a]">
          <p className="font-medium">오류 발생:</p>
          <p>{error}</p>
        </div>
      )}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Notion API 응답 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="properties">
              <TabsList>
                <TabsTrigger value="properties">속성 목록</TabsTrigger>
                <TabsTrigger value="stage">단계 속성 분석</TabsTrigger>
                <TabsTrigger value="raw">원본 데이터</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="mt-4">
                <h3 className="text-lg font-medium mb-2">사용 가능한 속성 목록</h3>
                <div className="bg-[#f8f8fc] p-4 rounded-md overflow-auto max-h-[400px]">
                  <ul className="space-y-2">
                    {data.properties?.map((prop: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="bg-[#e9e9f2] text-[#4b4b63] px-2 py-1 rounded text-sm font-mono">{prop}</span>
                        {prop.toLowerCase() === "단계" || prop.toLowerCase() === "stage" ? (
                          <span className="text-green-500 text-xs">✓ 단계 속성</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="stage" className="mt-4">
                <h3 className="text-lg font-medium mb-2">단계 속성 상세 정보</h3>
                <div className="bg-[#f8f8fc] p-4 rounded-md overflow-auto max-h-[400px]">
                  {data.stageInfo ? (
                    <div>
                      <p className="mb-2">
                        <span className="font-medium">속성 이름:</span> {data.stageInfo.propertyName}
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">속성 타입:</span> {data.stageInfo.propertyType}
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">추출된 값:</span> {data.stageInfo.value || "값 없음"}
                      </p>
                      <div className="mt-4">
                        <p className="font-medium mb-2">원본 데이터:</p>
                        <pre className="bg-[#e9e9f2] p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(data.stageInfo.rawData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#6e6e85]">단계 속성 정보를 찾을 수 없습니다.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
                <h3 className="text-lg font-medium mb-2">원본 API 응답</h3>
                <div className="bg-[#f8f8fc] p-4 rounded-md overflow-auto max-h-[400px]">
                  <pre className="text-xs font-mono">{JSON.stringify(data, null, 2)}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
