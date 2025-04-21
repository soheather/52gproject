import { HelpRequestForm } from "@/components/help-request-form"
import { HelpRequestList } from "@/components/help-request-list"

export default function HelpRequestsPage() {
  return (
    <main className="py-8 px-6 sm:px-8 lg:px-10 bg-[#F1F5F5] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d] text-center">서로 다른 우리가 만나면 무엇이든 할 수 있죠</h1>
          <p className="text-[#6e6e85] mt-1 text-center">여러분의 질문이나 도움이 필요한 사항을 남겨주세요.</p>
        </div>

        <div className="space-y-8">
          <HelpRequestForm />
          <HelpRequestList />
        </div>
      </div>
    </main>
  )
}
