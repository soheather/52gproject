"use client"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MinusCircle, RefreshCw, AlertTriangle } from "lucide-react"
import type { ChangeReport } from "./data-change-report"

interface DataChangeReportInlineProps {
  report: ChangeReport | null
  showRemoved?: boolean // 삭제된 항목 표시 여부 옵션 추가
  daysAgo?: number // 며칠 전 데이터 기준으로 할지 설정하는 옵션 추가
}

export function DataChangeReportInline({
  report,
  showRemoved = false, // 기본값은 삭제된 항목 표시하지 않음
  daysAgo = 7, // 기본값은 7일(일주일)
}: DataChangeReportInlineProps) {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <AlertTriangle className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-lg font-medium">데이터를 불러오는 중입니다</p>
        <p className="text-sm mt-1">잠시만 기다려주세요...</p>
      </div>
    )
  }

  // 일주일(daysAgo일) 이내에 추가되거나 수정된 항목만 필터링
  const now = new Date()
  const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo))

  // 추가된 항목 중 일주일 이내 항목만 필터링
  const recentAdded = report.added.filter((item) => {
    const itemDate = new Date(item.created_at !== "-" ? item.created_at : report.timestamp)
    return itemDate >= cutoffDate
  })

  // 수정된 항목은 모두 표시 (수정 시간은 report.timestamp 기준)
  const recentModified = report.modified

  // 삭제된 항목은 showRemoved가 true일 때만 표시
  const recentRemoved = showRemoved ? report.removed : []

  // 총 변경 사항 개수 계산
  const totalChanges = recentAdded.length + recentModified.length + recentRemoved.length

  if (totalChanges === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <AlertTriangle className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-lg font-medium">최근 {daysAgo}일 동안의 변경 사항이 없습니다</p>
        <p className="text-sm mt-1">이전 데이터와 현재 데이터가 동일합니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 변경 사항 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-green-100 p-2 mr-3">
            <PlusCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-green-700">추가된 항목</p>
            <p className="text-2xl font-bold text-green-800">{recentAdded.length}개</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center">
          <div className="rounded-full bg-blue-100 p-2 mr-3">
            <RefreshCw className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-700">수정된 항목</p>
            <p className="text-2xl font-bold text-blue-800">{recentModified.length}개</p>
          </div>
        </div>

        {showRemoved && recentRemoved.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center">
            <div className="rounded-full bg-red-100 p-2 mr-3">
              <MinusCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-700">삭제된 항목</p>
              <p className="text-2xl font-bold text-red-800">{recentRemoved.length}개</p>
            </div>
          </div>
        )}
      </div>

      {/* 상세 변경 사항 */}
      <ScrollArea className="max-h-[400px] pr-4">
        <div className="space-y-6">
          {/* 추가된 항목 */}
          {recentAdded.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <PlusCircle className="h-5 w-5 text-green-500" />
                추가된 항목 ({recentAdded.length}개)
              </h3>
              <div className="space-y-3">
                {recentAdded.map((item) => (
                  <div key={item.id} className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-green-800">{item.title}</h4>
                      <Badge className="bg-green-100 text-green-800">신규</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">단계:</span> {item.stage}
                      </div>
                      <div>
                        <span className="text-gray-500">PM:</span> {item.pm}
                      </div>
                      <div>
                        <span className="text-gray-500">회사:</span> {item.company}
                      </div>
                      <div>
                        <span className="text-gray-500">예상 일정:</span> {item.expected_schedule}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 수정된 항목 */}
          {recentModified.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                수정된 항목 ({recentModified.length}개)
              </h3>
              <div className="space-y-3">
                {recentModified.map((mod) => (
                  <div key={mod.item.id} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-blue-800">{mod.item.title}</h4>
                      <Badge className="bg-blue-100 text-blue-800">{mod.changes.length}개 필드 변경</Badge>
                    </div>
                    <div className="mt-2 space-y-2">
                      {mod.changes.map((change, idx) => (
                        <div key={idx} className="bg-white rounded p-2 text-sm">
                          <div className="font-medium text-gray-700">{change.field}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="line-through text-red-600">
                              {typeof change.oldValue === "boolean"
                                ? change.oldValue
                                  ? "예"
                                  : "아니오"
                                : change.oldValue || "(없음)"}
                            </div>
                            <span className="text-gray-500">→</span>
                            <div className="text-green-600 font-medium">
                              {typeof change.newValue === "boolean"
                                ? change.newValue
                                  ? "예"
                                  : "아니오"
                                : change.newValue || "(없음)"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 삭제된 항목 - showRemoved가 true일 때만 표시 */}
          {showRemoved && recentRemoved.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <MinusCircle className="h-5 w-5 text-red-500" />
                삭제된 항목 ({recentRemoved.length}개)
              </h3>
              <div className="space-y-3">
                {recentRemoved.map((item) => (
                  <div key={item.id} className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-red-800">{item.title}</h4>
                      <Badge className="bg-red-100 text-red-800">삭제됨</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">단계:</span> {item.stage}
                      </div>
                      <div>
                        <span className="text-gray-500">PM:</span> {item.pm}
                      </div>
                      <div>
                        <span className="text-gray-500">회사:</span> {item.company}
                      </div>
                      <div>
                        <span className="text-gray-500">예상 일정:</span> {item.expected_schedule}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
