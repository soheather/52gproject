import LoginClientPage from "./client-page"

// 이 페이지는 정적으로 생성되지 않음
export const dynamic = "force-dynamic"

// 이 페이지는 사전 렌더링되지 않음
export const generateStaticParams = () => {
  return []
}

export default function LoginPage() {
  return <LoginClientPage />
}
