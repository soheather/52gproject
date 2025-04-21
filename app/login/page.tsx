// 서버 컴포넌트 - useAuth를 직접 사용하지 않음
import LoginClientPage from "./client-page"

// 정적 생성 비활성화
export const dynamic = "force-dynamic"

export default function LoginPage() {
  return <LoginClientPage />
}
