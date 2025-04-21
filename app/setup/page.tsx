// Supabase 설정 페이지를 비활성화하고 안내 메시지 표시
export default function SetupPage() {
  return (
    <div className="py-8 px-6 sm:px-8 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2d3d]">Supabase 설정</h1>
          <p className="text-[#6e6e85] mt-1">이 기능은 현재 비활성화되어 있습니다.</p>
        </div>

        <div className="bg-[#fff2c4] border border-[#ffe7a0] rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#a17f22] mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-[#a17f22] text-lg font-medium">기능 비활성화</h3>
          </div>
          <p className="text-[#a17f22] mb-4">
            Supabase 연동 기능이 비활성화되었습니다. 현재 이 애플리케이션은 Notion API만 사용하도록 설정되어 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
