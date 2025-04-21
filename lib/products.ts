// Supabase 관련 코드를 제거하고 목업 데이터만 반환하도록 수정

export interface Product {
  id: string
  title: string
  thumbnail_url: string
  short_desc: string
  description: string
  usage_period: string
  company: string
  service_url: string
}

export interface ProductsResponse {
  products: Product[]
  count?: number
  error?: string
  code?: string
  createTableSQL?: string
  useMockData?: boolean
}

// 목업 제품 데이터
const mockProducts: Product[] = [
  {
    id: "1",
    title: "디지털 서비스 대시보드",
    thumbnail_url: "/placeholder.svg?height=300&width=400",
    short_desc: "조직의 디지털 서비스 현황을 한눈에 볼 수 있는 대시보드",
    description: "조직의 디지털 서비스 현황을 실시간으로 모니터링하고 관리할 수 있는 대시보드입니다.",
    usage_period: "2022~2023",
    company: "52g",
    service_url: "https://example.com/dashboard",
  },
  {
    id: "2",
    title: "모바일 앱 서비스",
    thumbnail_url: "/placeholder.svg?height=300&width=400",
    short_desc: "사용자 친화적인 모바일 앱 서비스",
    description: "사용자 경험을 최우선으로 고려한 모바일 앱 서비스입니다.",
    usage_period: "2021~현재",
    company: "파트너사",
    service_url: "https://example.com/mobile-app",
  },
  {
    id: "3",
    title: "데이터 분석 플랫폼",
    thumbnail_url: "/placeholder.svg?height=300&width=400",
    short_desc: "빅데이터 기반 분석 플랫폼",
    description: "대용량 데이터를 실시간으로 분석하고 인사이트를 제공하는 플랫폼입니다.",
    usage_period: "2023~현재",
    company: "사내IT팀",
    service_url: "https://example.com/data-analytics",
  },
]

// 서버 사이드에서 제품 데이터 가져오기 (Supabase 대신 목업 데이터 사용)
export async function getProducts(): Promise<ProductsResponse> {
  console.log("목업 제품 데이터 사용 중...")

  return {
    products: mockProducts,
    count: mockProducts.length,
    useMockData: true,
  }
}
