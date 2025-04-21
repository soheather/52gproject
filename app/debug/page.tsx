import { NotionDebugViewer } from "@/components/notion-debug-viewer"

export default function DebugPage() {
  return (
    <main className="py-8 px-6 sm:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">Notion API 디버깅</h1>
          <p className="text-[#6e6e85] mt-1">Notion API 응답 구조 분석 및 문제 해결</p>
        </div>

        <NotionDebugViewer />
      </div>
    </main>
  )
}
