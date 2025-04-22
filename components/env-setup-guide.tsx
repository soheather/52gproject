import { AlertTriangle } from "lucide-react"

interface EnvSetupGuideProps {
  missingVars: string[]
}

export function EnvSetupGuide({ missingVars }: EnvSetupGuideProps) {
  return (
    <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
        <h3 className="text-[#c44f6a] text-lg font-medium">환경 변수 설정 필요</h3>
      </div>
      <p className="text-[#c44f6a] mb-4">
        다음 환경 변수가 설정되지 않았습니다. .env.local 파일에 환경 변수를 추가하고 서버를 재시작해주세요.
      </p>
      <div className="bg-white bg-opacity-50 p-4 rounded-md text-[#c44f6a] text-sm">
        <p className="font-medium mb-2">다음 환경 변수를 설정해주세요:</p>
        <ul className="list-disc pl-5 space-y-1">
          {missingVars.map((varName) => (
            <li key={varName}>
              <code className="bg-[#ffc2d1] px-1 rounded">{varName}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4">환경 변수 설정 방법:</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            프로젝트 루트 디렉토리에 <code className="bg-[#ffc2d1] px-1 rounded">.env.local</code> 파일을 생성하세요.
          </li>
          <li>다음과 같은 형식으로 환경 변수를 추가하세요:</li>
          <pre className="bg-[#ffc2d1] bg-opacity-30 p-2 rounded overflow-x-auto mt-2">
            NOTION_API_KEY=your_api_key_here NOTION_DATABASE_ID_SERVICES=your_database_id_here
            NOTION_DATABASE_ID_PROJECTS=your_database_id_here
          </pre>
          <li>
            서버를 재시작하세요 (<code className="bg-[#ffc2d1] px-1 rounded">npm run dev</code>).
          </li>
        </ol>
      </div>
    </div>
  )
}
