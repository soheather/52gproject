"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { MockDataNotice } from "./mock-data-notice"

export function MockDashboard({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onRefresh} className="bg-[#a5a6f6] hover:bg-[#8384f3] text-white">
          <RefreshCw className="mr-2 h-4 w-4" />
          데이터 새로고침
        </Button>
      </div>

      <MockDataNotice />

      <Card className="bg-white rounded-xl shadow-sm p-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-[#2d2d3d]">샘플 데이터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-[#e8f4f4] rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-600 text-sm mb-1">완료된 작업</div>
                  <div className="text-3xl font-bold text-gray-800">75%</div>
                </div>
                <div className="text-2xl">📋</div>
              </div>
            </div>

            <div className="bg-[#f0f9d7] rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-600 text-sm mb-1">사용성 지표</div>
                  <div className="text-3xl font-bold text-gray-800">60%</div>
                </div>
                <div className="text-2xl">⭐</div>
              </div>
            </div>

            <div className="bg-[#e9e3f7] rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-600 text-sm mb-1">담당자 배정률</div>
                  <div className="text-3xl font-bold text-gray-800">85%</div>
                </div>
                <div className="text-2xl">⏱️</div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#f8f8fc] rounded-lg">
            <h3 className="font-medium text-[#4b4b63] mb-2">환경 변수 설정 방법</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-[#6e6e85]">
              <li>
                프로젝트 루트 디렉토리에 <code className="bg-[#e9e9f2] px-1 rounded">.env.local</code> 파일을
                생성하세요.
              </li>
              <li>다음과 같은 형식으로 환경 변수를 추가하세요:</li>
              <pre className="bg-[#e9e9f2] p-2 rounded overflow-x-auto mt-2 text-xs">
                NOTION_API_KEY=your_api_key_here NOTION_DATABASE_ID_SERVICES=your_database_id_here
                NOTION_DATABASE_ID_PROJECTS=your_database_id_here
              </pre>
              <li>
                서버를 재시작하세요 (<code className="bg-[#e9e9f2] px-1 rounded">npm run dev</code>).
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
