"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function MockDashboard({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onRefresh} className="bg-[#a5a6f6] hover:bg-[#8384f3] text-white">
          <RefreshCw className="mr-2 h-4 w-4" />
          데이터 새로고침
        </Button>
      </div>

      <Card className="bg-white rounded-xl shadow-sm p-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-[#2d2d3d]">샘플 데이터</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#6e6e85]">
            현재 Notion API에 연결할 수 없어 샘플 데이터를 표시하고 있습니다. 실제 데이터를 보려면 환경 변수를 확인하고
            다시 시도해주세요.
          </p>

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
        </CardContent>
      </Card>
    </div>
  )
}
