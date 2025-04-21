"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Bug, Database, RefreshCw } from "lucide-react"

export default function DirectDebugPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])

  const handleFetchDebugData = async () => {
    try {
      setLoading(true)
      setError(null)
      setConsoleOutput([])

      // 콘솔 출력 추가
      addConsoleOutput("Notion 직접 API 데이터 가져오는 중...")

      const response = await fetch("/api/test-notion-debug")
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      addConsoleOutput("직접 API 데이터 가져오기 성공")

      // stage 속성 디버깅
      if (result.stagePropertyInfo && result.stagePropertyInfo.length > 0) {
        addConsoleOutput("--- Stage 속성 디버깅 정보 ---")

        result.stagePropertyInfo.forEach((info, index) => {
          if (info.error) {
            addConsoleOutput(`항목 ${index + 1}: ${info.error}`)
          } else {
            addConsoleOutput(`항목 ${index + 1}: 속성명 "${info.propertyName}", 타입: ${info.propertyType}`)

            // properties["stage"]?.select?.name 확인
            if (info.propertyType === "select") {
              const selectName = info.selectName
              addConsoleOutput(`  properties["${info.propertyName}"]?.select?.name = ${selectName || "null"}`)
            } else {
              addConsoleOutput(`  properties["${info.propertyName}"] 타입이 select가 아님: ${info.propertyType}`)
            }

            addConsoleOutput(`  추출된 값: ${info.extractedValue || "null"}`)
          }
        })
      } else {
        addConsoleOutput("Stage 속성 정보가 없습니다.")
      }

      setData(result)
    } catch (err) {
      console.error("직접 API 데이터 가져오기 오류:", err)
      setError(err instanceof Error ? err.message : String(err))
      addConsoleOutput(`오류 발생: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // 콘솔 출력 추가 함수
  const addConsoleOutput = (message: string) => {
    setConsoleOutput((prev) => [...prev, message])
  }

  // 캐시 초기화 함수
  const clearCache = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      addConsoleOutput("로컬 스토리지와 세션 스토리지가 초기화되었습니다.")
      addConsoleOutput("페이지를 새로고침하려면 Cmd+Shift+R(Mac) 또는 Ctrl+Shift+R(Windows)를 누르세요.")
    } catch (err) {
      addConsoleOutput(`캐시 초기화 중 오류 발생: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <main className="py-8 px-6 sm:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">Notion API 직접 디버깅</h1>
          <p className="text-[#6e6e85] mt-1">Notion API 직접 호출 결과 확인</p>
        </div>

        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-[#a5a6f6]" />
              <h2 className="text-xl font-bold text-[#2d2d3d]">Notion API 직접 호출 디버그</h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={clearCache}
                variant="outline"
                className="bg-[#fff2c4] hover:bg-[#ffe7a0] text-[#a17f22] border-[#ffe7a0]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                캐시 초기화
              </Button>
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
          </div>

          {/* 콘솔 출력 영역 */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">콘솔 출력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#1e1e1e] text-white p-4 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                {consoleOutput.length > 0 ? (
                  consoleOutput.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap mb-1">
                      {line.startsWith("오류") ? (
                        <span className="text-red-400">{line}</span>
                      ) : line.includes("properties[") ? (
                        <span className="text-yellow-300">{line}</span>
                      ) : (
                        line
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">디버깅 버튼을 클릭하여 Notion API 데이터를 가져오세요.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-4 text-[#c44f6a]">
              <p className="font-medium">오류 발생:</p>
              <p>{error}</p>
            </div>
          )}

          {data && (
            <Card>
              <CardHeader>
                <CardTitle>Notion API 직접 호출 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stage">
                  <TabsList>
                    <TabsTrigger value="stage">Stage 속성 분석</TabsTrigger>
                    <TabsTrigger value="properties">모든 속성</TabsTrigger>
                    <TabsTrigger value="raw">원본 데이터</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stage" className="mt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Stage 속성 분석 ({data.stagePropertyInfo?.length || 0}개 항목)
                    </h3>
                    <div className="bg-[#f8f8fc] p-4 rounded-md overflow-auto max-h-[600px]">
                      {data.stagePropertyInfo?.map((info, index) => (
                        <div key={index} className="mb-6 p-4 bg-white rounded-md shadow-sm">
                          <h4 className="font-bold text-[#2d2d3d] mb-2">항목 {index + 1}</h4>
                          {info.error ? (
                            <div>
                              <p className="text-red-500 mb-2">{info.error}</p>
                              <p className="text-sm mb-2">
                                <span className="font-medium">사용 가능한 속성:</span>{" "}
                                {info.availableProperties?.join(", ") || "없음"}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm mb-2">
                                <span className="font-medium">속성 이름:</span> {info.propertyName}
                              </p>
                              <p className="text-sm mb-2">
                                <span className="font-medium">속성 타입:</span> {info.propertyType}
                              </p>
                              <p className="text-sm mb-2">
                                <span className="font-medium">select.name 존재:</span>{" "}
                                {info.hasSelectName ? "✅ 있음" : "❌ 없음"}
                              </p>
                              {info.hasSelectName && (
                                <p className="text-sm mb-2">
                                  <span className="font-medium">select.name 값:</span>{" "}
                                  <span className="bg-[#e1f5c4] text-[#5a7052] px-2 py-1 rounded-full text-xs">
                                    {info.selectName}
                                  </span>
                                </p>
                              )}
                              <p className="text-sm mb-2">
                                <span className="font-medium">추출된 값:</span>{" "}
                                <span className="bg-[#c5e8ff] text-[#3a6ea5] px-2 py-1 rounded-full text-xs">
                                  {info.extractedValue || "값 없음"}
                                </span>
                              </p>
                              <div className="mt-2">
                                <p className="font-medium text-sm mb-1">원본 데이터:</p>
                                <pre className="bg-[#f8f8fc] p-2 rounded text-xs overflow-auto max-h-[200px]">
                                  {JSON.stringify(info.rawData, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="properties" className="mt-4">
                    <h3 className="text-lg font-medium mb-2">사용 가능한 속성 목록</h3>
                    <div className="bg-[#f8f8fc] p-4 rounded-md overflow-auto max-h-[400px]">
                      <ul className="space-y-2">
                        {data.properties?.map((prop: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="bg-[#e9e9f2] text-[#4b4b63] px-2 py-1 rounded text-sm font-mono">
                              {prop}
                            </span>
                            {prop.toLowerCase() === "stage" || prop.toLowerCase() === "단계" ? (
                              <span className="text-green-500 text-xs">✓ 단계 속성</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="raw" className="mt-4">
                    <h3 className="text-lg font-medium mb-2">원본 API 응답</h3>
                    <div className="bg-[#f8f8fc] p-4 rounded-md overflow-auto max-h-[600px]">
                      <pre className="text-xs font-mono">{JSON.stringify(data.sample, null, 2)}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
