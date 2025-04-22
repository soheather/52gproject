import { HelpRequestForm } from "@/components/help-request-form"
import { HelpRequestList } from "@/components/help-request-list"

export default function HelpRequestsPage() {
  return (
    <main className="py-8 px-6 sm:px-8 lg:px-10 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column (1 part) - Title and form */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#2d2d3d]">서로 다른 우리가 만나면 무엇이든 할 수 있죠</h1>
              <p className="text-[#6e6e85] mt-2">여러분의 질문이나 도움이 필요한 사항을 남겨주세요.</p>
            </div>
            <HelpRequestForm />
          </div>

          {/* Right column (3 parts) - Cards */}
          <div className="lg:col-span-3">
            <HelpRequestList />
          </div>
        </div>
      </div>
    </main>
  )
}
