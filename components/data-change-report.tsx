"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MinusCircle, RefreshCw, AlertTriangle } from "lucide-react"

// 프로젝트 아이템 타입 정의
export type ProjectItem = {
  id: string
  title: string
  status: string
  stage: string
  stage_ally?: string
  pm: string
  company: string
  stakeholder: string
  training: boolean
  genai: boolean
  digital_output: boolean
  expected_schedule: string
  project_doc: string
  created_at: string
}

// 변경 사항 타입 정의
export type ChangeReport = {
  added: ProjectItem[]
  removed: ProjectItem[]
  modified: {
    item: ProjectItem
    changes: {
      field: string
      oldValue: any
      newValue: any
    }[]
  }[]
  timestamp: string
}

interface DataChangeReportProps {
  isOpen: boolean
  onClose: () => void
  report: ChangeReport | null
}

export function DataChangeReport({ isOpen, onClose, report }: DataChangeReportProps) {
  if (!report) return null

  const totalChanges = report.added.length + report.removed.length + report.modified.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[#a5a6f6]" />
            데이터 변경 사항 리포트
          </DialogTitle>
          <DialogDescription>
            {report.timestamp}에 업데이트된 데이터의 변경 사항입니다. 총 {totalChanges}개의 변경 사항이 있습니다.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-6 pr-4">
            {/* 추가된 항목 */}
            {report.added.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <PlusCircle className="h-5 w-5 text-green-500" />
                  추가된 항목 ({report.added.length}개)
                </h3>
                <div className="space-y-3">
                  {report.added.map((item) => (
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
            {report.modified.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  수정된 항목 ({report.modified.length}개)
                </h3>
                <div className="space-y-3">
                  {report.modified.map((mod) => (
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

            {/* 삭제된 항목 */}
            {report.removed.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <MinusCircle className="h-5 w-5 text-red-500" />
                  삭제된 항목 ({report.removed.length}개)
                </h3>
                <div className="space-y-3">
                  {report.removed.map((item) => (
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

            {/* 변경 사항이 없는 경우 */}
            {totalChanges === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-lg font-medium">변경 사항이 없습니다</p>
                <p className="text-sm mt-1">이전 데이터와 현재 데이터가 동일합니다.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// 데이터 변경 사항을 계산하는 유틸리티 함수
export function calculateChanges(oldData: ProjectItem[], newData: ProjectItem[]): ChangeReport {
  const oldMap = new Map(oldData.map((item) => [item.id, item]))
  const newMap = new Map(newData.map((item) => [item.id, item]))

  // 추가된 항목
  const added = newData.filter((item) => !oldMap.has(item.id))

  // 삭제된 항목
  const removed = oldData.filter((item) => !newMap.has(item.id))

  // 수정된 항목
  const modified = newData
    .filter((newItem) => {
      const oldItem = oldMap.get(newItem.id)
      return oldItem && !isEqual(oldItem, newItem)
    })
    .map((newItem) => {
      const oldItem = oldMap.get(newItem.id)!
      const changes = findChanges(oldItem, newItem)
      return { item: newItem, changes }
    })
    .filter((mod) => mod.changes.length > 0)

  return {
    added,
    removed,
    modified,
    timestamp: new Date().toLocaleString("ko-KR"),
  }
}

// 두 객체가 동일한지 확인하는 함수
function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false
  }

  return true
}

// 두 객체 간의 변경 사항을 찾는 함수
function findChanges(oldItem: ProjectItem, newItem: ProjectItem) {
  const changes: { field: string; oldValue: any; newValue: any }[] = []

  // 필드 이름을 한글로 매핑
  const fieldNames: Record<string, string> = {
    title: "프로젝트명",
    status: "상태",
    stage: "단계",
    stage_ally: "단계 동맹",
    pm: "PM",
    company: "회사",
    stakeholder: "이해관계자",
    training: "교육",
    genai: "생성형 AI",
    digital_output: "디지털 산출물",
    expected_schedule: "예상 일정",
    project_doc: "프로젝트 문서",
  }

  // 모든 필드 비교
  Object.keys(oldItem).forEach((key) => {
    // id와 created_at은 비교에서 제외
    if (key !== "id" && key !== "created_at") {
      if (oldItem[key as keyof ProjectItem] !== newItem[key as keyof ProjectItem]) {
        changes.push({
          field: fieldNames[key] || key,
          oldValue: oldItem[key as keyof ProjectItem],
          newValue: newItem[key as keyof ProjectItem],
        })
      }
    }
  })

  return changes
}
