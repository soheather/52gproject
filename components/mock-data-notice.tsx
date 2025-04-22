import { AlertTriangle } from "lucide-react"

export function MockDataNotice() {
  return (
    <div className="bg-[#fff2c4] border border-[#ffe7a0] rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-[#a17f22] mr-2" />
        <p className="text-[#a17f22] text-sm">
          <span className="font-medium">환경 변수가 설정되지 않아 샘플 데이터를 표시합니다.</span> 실제 데이터를 보려면
          환경 변수를 설정하세요.
        </p>
      </div>
    </div>
  )
}
