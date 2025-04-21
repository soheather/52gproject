"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Loader2,
  BarChart3,
  Clock,
  ListChecks,
  CheckCircle2,
} from "lucide-react"
import { ProjectStageChart } from "./project-stage-chart"
// 상단에 RefreshProjectsButton import 추가
import { RefreshProjectsButton } from "@/components/refresh-projects-button"

// ProjectItem 타입 정의 - 2025 프로젝트 리스트 구조에 맞게 업데이트
type ProjectItem = {
  id: string
  title: string
  status: string
  stage: string
  stage_ally: string
  pm: string
  company: string
  stakeholder: string
  training: boolean
  genai: boolean
  digital_output: boolean
  expected_schedule: string
  project_doc: string
  created_at: string
}

export default function ProjectsList2025({ notionData }: { notionData: any }) {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProjectItem | null
    direction: "ascending" | "descending"
  }>({
    key: null,
    direction: "ascending",
  })
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 상태 변수 추가
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // 테이블 렌더링 최적화: 가상화 적용을 위한 준비
  // 테이블 데이터를 페이징 처리하여 한 번에 표시할 항목 수 제한

  // 페이징 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20) // 한 페이지당 표시할 항목 수

  // 카드 클릭 핸들러 함수를 수정합니다:
  const handleCategoryClick = (category: string) => {
    // 이미 활성화된 카테고리를 다시 클릭하면 닫히도록 토글 기능 추가
    if (activeCategory === category) {
      setActiveCategory(null)
    } else {
      setActiveCategory(category)
    }
  }

  // 전체 프로젝트 카드 클릭 핸들러 추가
  const handleAllProjectsClick = () => {
    // 모든 카테고리 비활성화하여 초기 화면으로 돌아가기
    setActiveCategory(null)
    // 검색어도 초기화
    setSearchTerm("")
  }

  // Notion 데이터 처리
  useEffect(() => {
    try {
      setLoading(true)
      setError(null)

      if (!notionData) {
        setError("Notion 데이터가 제공되지 않았습니다.")
        setProjects([])
        setLoading(false)
        return
      }

      if (notionData.error) {
        setError(notionData.error)
        setProjects([])
        setLoading(false)
        return
      }

      if (!notionData.results || !Array.isArray(notionData.results)) {
        setError("Notion API에서 유효한 결과를 반환하지 않았습니다.")
        setProjects([])
        setLoading(false)
        return
      }

      // 타임스탬프 업데이트
      setLastUpdated(new Date().toLocaleString("ko-KR"))

      // 첫 번째 항목의 속성 이름 로깅
      if (notionData.results.length > 0) {
        console.log("사용 가능한 속성 이름:", Object.keys(notionData.results[0].properties))
      }

      // Notion API 응답 데이터 처리 - 2025 프로젝트 리스트 구조에 맞게 업데이트
      const processedData = notionData.results.map((item: any) => {
        // 단계 속성 특별 처리 - 간단한 방식으로 수정
        // 기존 코드:
        // const stageValue = item.properties["단계"]?.select?.name || item.properties["stage"]?.select?.name || "-"

        // 수정된 코드:
        const stageValue = (() => {
          // 1. 정확한 속성 이름으로 직접 찾기
          if (item.properties["단계"]?.select?.name) {
            return item.properties["단계"].select.name
          }

          if (item.properties["stage"]?.select?.name) {
            return item.properties["stage"].select.name
          }

          // 2. 대소문자 구분 없이 찾기 - 최적화된 방식
          for (const [key, value] of Object.entries(item.properties)) {
            if (
              (key.toLowerCase() === "단계" || key.toLowerCase() === "stage") &&
              value.type === "select" &&
              value.select?.name
            ) {
              return value.select.name
            }
          }

          return "-"
        })()

        // 디버깅 로그 추가
        // console.log(`항목 ID: ${item.id}, 단계 값: ${stageValue}`)

        return {
          id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
          title: getPropertyValue(item, "title") || getPropertyValue(item, "이름") || "제목 없음",
          status: getPropertyValue(item, "status") || getPropertyValue(item, "상태") || "미정",
          stage: stageValue, // 추출된 단계 값 사용
          stage_ally: getPropertyValue(item, "stage_ally") || "-",
          pm: getPropertyValue(item, "pm") || getPropertyValue(item, "PM") || "-",
          company: getPropertyValue(item, "company") || getPropertyValue(item, "회사") || "-",
          stakeholder: getPropertyValue(item, "stakeholder") || getPropertyValue(item, "이해관계자") || "-",
          training: getPropertyBooleanValue(item, "training") || getPropertyBooleanValue(item, "교육"),
          genai: getPropertyBooleanValue(item, "genai") || getPropertyBooleanValue(item, "생성형 AI"),
          digital_output:
            getPropertyBooleanValue(item, "digital_output") || getPropertyBooleanValue(item, "디지털 산출물"),
          expected_schedule: formatDateRange(getPropertyValue(item, "expected_schedule")) || "-",
          project_doc: getPropertyValue(item, "project_doc") || "",
          created_at: formatDate(item.created_time) || "-",
        }
      })

      setProjects(processedData)
      // console.log(`프로젝트 데이터 처리 완료: ${processedData.length}개 항목}`)

      // 단계 값 로깅
      // const stageValues = processedData.map((p) => p.stage).filter((s) => s !== "-")
      // console.log("단계 값 목록:", stageValues)
    } catch (error) {
      console.error("프로젝트 데이터 처리 오류:", error)
      setError(`데이터 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [notionData])

  // 데이터 새로고침 함수
  // refreshData 함수를 수정하여 페이지 새로고침 대신 데이터만 새로고침하도록 변경
  const refreshData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // 페이지 새로고침 대신 Notion API에서 최신 데이터 가져오기
      // const freshData = await fetchNotionData({
      //   forceRefresh: true,
      //   databaseId: process.env.NOTION_DATABASE_ID_PROJECTS,
      // })

      // if (freshData.error) {
      //   setError(freshData.error)
      //   return
      // }

      // // 타임스탬프 업데이트
      // setLastUpdated(new Date().toLocaleString("ko-KR"))

      // // 새로운 데이터 처리
      // const processedData = freshData.results.map((item: any) => {
      //   return {
      //     id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
      //     title: getPropertyValue(item, "title") || "제목 없음",
      //     status: getPropertyValue(item, "status") || "미정",
      //     stage: getPropertyValue(item, "stage") || "-",
      //     stage_ally: getPropertyValue(item, "stage_ally") || "-",
      //     pm: getPropertyValue(item, "pm") || "-",
      //     company: getPropertyValue(item, "company") || "-",
      //     stakeholder: getPropertyValue(item, "stakeholder") || "-",
      //     training: getPropertyBooleanValue(item, "training"),
      //     genai: getPropertyBooleanValue(item, "genai"),
      //     digital_output: getPropertyBooleanValue(item, "digital_output"),
      //     expected_schedule: formatDateRange(getPropertyValue(item, "expected_schedule")) || "-",
      //     project_doc: getPropertyValue(item, "project_doc") || "",
      //     created_at: formatDate(item.created_time) || "-",
      //   }
      // })

      // setProjects(processedData)
      // console.log(`프로젝트 데이터 새로고침 완료: ${processedData.length}개 항목`)
      window.location.reload()
    } catch (error) {
      console.error("데이터 새로고침 오류:", error)
      setError(`데이터 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setRefreshing(false)
    }
  }

  // 새로운 handleRefreshData 함수 추가
  const handleRefreshData = (data: any) => {
    if (!data || data.error) {
      setError(data?.error || "데이터를 가져오는 중 오류가 발생했습니다.")
      return
    }

    // 타임스탬프 업데이트
    setLastUpdated(new Date().toLocaleString("ko-KR"))

    // 새로운 데이터 처리
    const processedData = data.results.map((item: any) => {
      return {
        id: item.id || `id-${Math.random().toString(36).substr(2, 9)}`,
        title: getPropertyValue(item, "title") || "제목 없음",
        status: getPropertyValue(item, "status") || "미정",
        stage: getPropertyValue(item, "stage") || "-",
        stage_ally: getPropertyValue(item, "stage_ally") || "-",
        pm: getPropertyValue(item, "pm") || "-",
        company: getPropertyValue(item, "company") || "-",
        stakeholder: getPropertyValue(item, "stakeholder") || "-",
        training: getPropertyBooleanValue(item, "training"),
        genai: getPropertyBooleanValue(item, "genai"),
        digital_output: getPropertyBooleanValue(item, "digital_output"),
        expected_schedule: formatDateRange(getPropertyValue(item, "expected_schedule")) || "-",
        project_doc: getPropertyValue(item, "project_doc") || "",
        created_at: formatDate(item.created_time) || "-",
      }
    })

    setProjects(processedData)
    setError(null)
    console.log(`프로젝트 데이터 새로고침 완료: ${processedData.length}개 항목`)
  }

  // Notion 속성값 추출 헬퍼 함수
  function getPropertyValue(item: any, propertyName: string): string | null {
    try {
      if (!item || !item.properties) {
        console.warn(`항목 또는 properties가 없습니다: ${JSON.stringify(item)}`)
        return null
      }

      // getPropertyValue 함수에서 속성 이름 찾는 부분 수정
      // 대소문자 구분 없이 속성 이름 찾기 (한글 이름도 고려)
      // 수정: 정확히 일치하는 속성 이름 먼저 확인

      // 1. 정확히 일치하는 속성 이름 확인
      if (item.properties[propertyName]) {
        return extractPropertyValueByType(item.properties[propertyName])
      }

      // 2. 특수 케이스 처리 (stage/단계)
      if (propertyName === "stage" || propertyName === "단계") {
        // 기존 코드를 제거하고 새로운 방식으로 대체
        const 단계값 =
          Object.entries(item.properties).find(([key]) => key === "단계" || key.toLowerCase() === "stage")?.[1]?.select
            ?.name ?? "-"

        // console.log(`항목 ID: ${item.id}, 단계 값 추출 결과: ${단계값}`)
        return 단계값
      }

      // 3. 대소문자 구분 없이 속성 이름 찾기
      const actualPropertyName = Object.keys(item.properties).find(
        (key) =>
          key.toLowerCase() === propertyName.toLowerCase() ||
          (propertyName === "stage" && (key.toLowerCase() === "단계" || key.toLowerCase() === "stage")) ||
          (propertyName === "단계" && (key.toLowerCase() === "단계" || key.toLowerCase() === "stage")) ||
          (propertyName === "title" && key === "이름") ||
          (propertyName === "status" && key === "상태") ||
          (propertyName === "pm" && key === "PM") ||
          (propertyName === "company" && key === "회사") ||
          (propertyName === "stakeholder" && key === "이해관계자"),
      )

      // 속성 추출 헬퍼 함수 (내부 함수로 분리)
      function extractPropertyValueByType(property) {
        // 디버깅 로그 추가
        // if (propertyName.toLowerCase() === "stage" || propertyName === "단계") {
        //   console.log(`단계 속성 데이터:`, JSON.stringify(property, null, 2))
        // }

        // 속성 타입에 따라 값 추출
        switch (property.type) {
          case "select":
            return property.select?.name || null
          case "multi_select":
            return property.multi_select?.[0]?.name || null
          case "rich_text":
            return property.rich_text?.[0]?.plain_text || null
          case "title":
            return property.title?.[0]?.plain_text || null
          case "people":
            // 여러 사람이 있을 경우 이름을 쉼표로 구분하여 반환
            return property.people?.map((person) => person.name).join(", ") || null
          case "date":
            return property.date?.start || null
          case "url":
            return property.url || null
          case "formula":
            // formula 타입 처리 추가
            if (property.formula.type === "string") {
              return property.formula.string || null
            }
            return null
          case "checkbox":
            return property.checkbox ? "Yes" : "No"
          case "number":
            return property.number?.toString() || null
          case "email":
            return property.email || null
          case "phone_number":
            return property.phone_number || null
          case "relation":
            return property.relation?.length > 0 ? `${property.relation.length}개 항목` : null
          case "rollup":
            if (property.rollup.type === "array") {
              return property.rollup.array?.length > 0 ? `${property.rollup.array.length}개 항목` : null
            }
            return null
          default:
            console.warn(`지원되지 않는 속성 타입: ${property.type} (${propertyName})`)
            return null
        }
      }
    } catch (error) {
      console.error(`${propertyName} 속성 추출 오류:`, error)
      return null
    }
  }

  // 불리언 값 추출 헬퍼 함수
  function getPropertyBooleanValue(item: any, propertyName: string): boolean {
    try {
      if (!item || !item.properties) {
        return false
      }

      // 대소문자 구분 없이 속성 이름 찾기 (한글 이름도 고려)
      const actualPropertyName = Object.keys(item.properties).find(
        (key) =>
          key.toLowerCase() === propertyName.toLowerCase() ||
          (propertyName === "training" && key === "교육") ||
          (propertyName === "genai" && key === "생성형 AI") ||
          (propertyName === "digital_output" && key === "디지털 산출물"),
      )

      if (!actualPropertyName) {
        return false
      }

      const property = item.properties[actualPropertyName]

      // 속성 타입에 따라 값 추출
      switch (property.type) {
        case "checkbox":
          return property.checkbox || false
        case "select":
          return property.select?.name === "Yes" || property.select?.name === "있음" || false
        case "formula":
          if (property.formula.type === "boolean") {
            return property.formula.boolean || false
          }
          return false
        default:
          return false
      }
    } catch (error) {
      console.error(`${propertyName} 불리언 속성 추출 오류:`, error)
      return false
    }
  }

  // 날짜 포맷팅 함수
  function formatDate(dateString: string | null): string {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch (error) {
      return dateString
    }
  }

  // 날짜 범위 포맷팅 함수
  function formatDateRange(dateString: string | null): string {
    if (!dateString) return "-"

    // 날짜 범위가 "2025년 2월 17일 → 2025년 8월 31일" 형식인지 확인
    if (dateString.includes("→")) {
      return dateString
    }

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch (error) {
      return dateString
    }
  }

  // 정렬 처리 함수
  const requestSort = (key: keyof ProjectItem) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // 정렬된 데이터 가져오기
  const getSortedProjects = () => {
    const filteredProjects = projects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.pm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.stage.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (!sortConfig.key) return filteredProjects

    return [...filteredProjects].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // 프로젝트 통계 계산
  const getProjectStats = () => {
    // 전체 프로젝트 수
    const totalProjects = projects.length

    // 진행보류/진행후보/진행확정 프로젝트 필터링 - 통합된 카테고리
    const planningProjectsList = projects.filter(
      (project) =>
        project.stage.includes("진행보류") ||
        project.stage.includes("진행후보") ||
        project.stage.includes("진행확정") ||
        project.stage.includes("할 일"),
    )
    const planningProjects = planningProjectsList.length

    // 진행 중인 프로젝트 필터링 (모든 "진행중:" 포함 항목)
    const inProgressProjectsList = projects.filter(
      (project) => project.stage.includes("진행중") || project.stage.includes("진행 중"),
    )
    const inProgressProjects = inProgressProjectsList.length

    // 완료된 프로젝트 필터링
    const completedProjectsList = projects.filter(
      (project) => project.stage.includes("진행완료") || project.stage.includes("완료"),
    )
    const completedProjects = completedProjectsList.length

    return {
      totalProjects,
      planningProjects,
      planningProjectsList,
      inProgressProjects,
      inProgressProjectsList,
      completedProjects,
      completedProjectsList,
    }
  }

  // 프로젝트 통계 데이터를 useMemo로 계산
  const projectStats = useMemo(() => getProjectStats(), [projects])

  // 프로젝트 단계별 분포 데이터 계산 함수
  const getProjectStageDistribution = () => {
    // projectStats에서 계산된 데이터 사용
    const stats = getProjectStats()

    // 단계별 카운트를 저장할 객체 - 세 가지 카테고리로 단순화
    const stageCounts: Record<string, number> = {
      "진행보류/후보/확정": stats.planningProjects,
      진행중: stats.inProgressProjects,
      진행완료: stats.completedProjects,
    }

    // 전체 프로젝트 수
    const total = projects.length

    // 차트 데이터 형식으로 변환
    const chartData = Object.entries(stageCounts)
      .map(([name, value]) => {
        // 각 카테고리별 색상 지정
        let color = "#e9e9e9"
        if (name === "진행보류/후보/확정")
          color = "#fff2c4" // 연한 노란색
        else if (name === "진행중")
          color = "#c5e8ff" // 연한 파란색
        else if (name === "진행완료") color = "#e1f5c4" // 연한 녹색

        return {
          name,
          value,
          percentage: total > 0 ? Math.round((value / total) * 100) : 0,
          color,
        }
      })
      .sort((a, b) => {
        // 특정 순서로 정렬
        const order = { "진행보류/후보/확정": 1, 진행중: 2, 진행완료: 3 }
        return order[a.name as keyof typeof order] - order[b.name as keyof typeof order]
      })

    return chartData
  }

  // 상태에 따른 배지 색상 결정
  const getStatusBadge = (status: string) => {
    if (status.includes("진행중")) {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status.includes("진행완료")) {
      return <Badge className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else if (status.includes("진행보류")) {
      return <Badge className="bg-[#fff2c4] text-[#a17f22] rounded-full font-medium px-3 py-1">{status}</Badge>
    } else {
      return <Badge className="bg-[#e9e9f2] text-[#6e6e85] rounded-full font-medium px-3 py-1">{status}</Badge>
    }
  }

  // 스테이지에 따른 배지 색상 결정
  const getStageBadge = (stage: string) => {
    // 진행보류/진행후보/진행확정 관련
    if (
      stage.includes("진행보류") ||
      stage.includes("진행후보") ||
      stage.includes("진행확정") ||
      stage.includes("할 일")
    ) {
      return <Badge className="bg-[#fff2c4] text-[#a17f22] rounded-full font-medium px-3 py-1">{stage}</Badge>
    }
    // 진행중 관련 - 세부 단계별 구분
    else if (stage.includes("진행중: 리서치") || stage.includes("진행중 : 리서치")) {
      return <Badge className="bg-[#d8d9f8] text-[#5151d3] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else if (stage.includes("진행중: 문제정의") || stage.includes("진행중 : 문제정의")) {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else if (stage.includes("진행중: 계획수립") || stage.includes("진행중 : 계획수립")) {
      return <Badge className="bg-[#f9e0c3] text-[#c44f6a] rounded-full font-medium px-3 py-1">{stage}</Badge>
    } else if (stage.includes("진행중: 프로토타입") || stage.includes("진행중 : 프로토타입")) {
      return <Badge className="bg-[#fcd34d] text-[#92400e] rounded-full font-medium px-3 py-1">{stage}</Badge>
    }
    // 일반 진행중
    else if (stage.includes("진행중") || stage.includes("진행 중")) {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{stage}</Badge>
    }
    // 완료 관련
    else if (stage.includes("진행완료") || stage.includes("완료")) {
      return <Badge className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">{stage}</Badge>
    }
    // 기타
    else {
      return <Badge className="bg-[#e9e9f2] text-[#6e6e85] rounded-full font-medium px-3 py-1">{stage}</Badge>
    }
  }

  // 회사에 따른 배지 색상 결정
  const getCompanyBadge = (company: string) => {
    if (company.includes("GS리테일")) {
      return <Badge className="bg-[#ffd6e0] text-[#c44f6a] rounded-full font-medium px-3 py-1">{company}</Badge>
    } else if (company.includes("GS편의점")) {
      return <Badge className="bg-[#c5e8ff] text-[#3a6ea5] rounded-full font-medium px-3 py-1">{company}</Badge>
    } else if (company.includes("GS더프레시")) {
      return <Badge className="bg-[#e1f5c4] text-[#5a7052] rounded-full font-medium px-3 py-1">{company}</Badge>
    } else if (company.includes("GS")) {
      return <Badge className="bg-[#d8d9f8] text-[#5151d3] rounded-full font-medium px-3 py-1">{company}</Badge>
    } else {
      return <Badge className="bg-[#e9e9f2] text-[#6e6e85] rounded-full font-medium px-3 py-1">{company}</Badge>
    }
  }

  // 불리언 값 표시 함수
  const renderBoolean = (value: boolean) => {
    return value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-gray-300" />
  }

  // 정렬된 프로젝트 목록을 메모이제이션
  const sortedProjects = useMemo(() => getSortedProjects(), [projects, searchTerm, sortConfig])

  // 페이징된 데이터 계산
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedProjects, currentPage, itemsPerPage])

  // 총 페이지 수 계산
  const totalPages = useMemo(() => Math.ceil(sortedProjects.length / itemsPerPage), [sortedProjects, itemsPerPage])

  // 프로젝트 단계 분포 데이터를 메모이제이션
  const stageDistributionData = useMemo(() => getProjectStageDistribution(), [projectStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#a5a6f6]" />
        <span className="ml-2 text-[#6e6e85]">데이터 로딩 중...</span>
      </div>
    )
  }

  // 오류가 있을 때 표시할 메시지
  if (error) {
    return (
      <div className="bg-[#ffd6e0] border border-[#ffc2d1] rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-[#c44f6a] mr-2" />
          <h3 className="text-[#c44f6a] text-lg font-medium">데이터 로드 오류</h3>
        </div>
        <p className="text-[#c44f6a] mb-4">{error}</p>
        <Button onClick={refreshData} className="mt-2 bg-[#a5a6f6] hover:bg-[#8384f3] text-white" disabled={refreshing}>
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              새로고침 중...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              데이터 새로고침
            </>
          )}
        </Button>
      </div>
    )
  }

  // 데이터가 없을 때 표시할 메시지
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-[#4b4b63] mb-2">프로젝트 데이터가 없습니다</h3>
          <p className="text-[#6e6e85] max-w-md mx-auto mb-6">
            Notion 데이터베이스에 프로젝트 데이터가 없거나, 데이터베이스 연결에 문제가 있습니다.
          </p>
          <Button
            onClick={refreshData}
            variant="outline"
            className="border-[#e9e9f2] text-[#6e6e85] hover:text-[#4b4b63] bg-[#f8f8fc] hover:bg-[#f0f0f8]"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "업데이트 중..." : "업데이트"}
          </Button>
        </div>
      </div>
    )
  }

  // 프로젝트 단계 분포 데이터 가져오기
  // const stageDistributionData = getProjectStageDistribution()

  return (
    <div className="space-y-6">
      {/* 프로젝트 현황 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={handleAllProjectsClick}
        >
          <div className="rounded-full bg-[#f0f0ff] p-3 mr-4">
            <BarChart3 className="h-6 w-6 text-[#7b7bf7]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">전체 프로젝트</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.totalProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => handleCategoryClick("planning")}
        >
          <div className="rounded-full bg-[#fff2c4] bg-opacity-50 p-3 mr-4">
            <Clock className="h-6 w-6 text-[#a17f22]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행보류/후보/확정</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.planningProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => handleCategoryClick("inProgress")}
        >
          <div className="rounded-full bg-[#c5e8ff] bg-opacity-50 p-3 mr-4">
            <ListChecks className="h-6 w-6 text-[#3a6ea5]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행중</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.inProgressProjects}개</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:bg-[#f8f8fc] transition-colors"
          onClick={() => handleCategoryClick("completed")}
        >
          <div className="rounded-full bg-[#e1f5c4] bg-opacity-50 p-3 mr-4">
            <CheckCircle2 className="h-6 w-6 text-[#5a7052]" />
          </div>
          <div>
            <p className="text-[#6e6e85] text-sm">진행완료</p>
            <p className="text-2xl font-bold text-[#2d2d3d]">{projectStats.completedProjects}개</p>
          </div>
        </div>
      </div>

      {activeCategory === "planning" && projectStats.planningProjectsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-[#a17f22] mr-2" />
            <h3 className="text-lg font-bold text-[#2d2d3d]">
              진행보류/후보/확정 프로젝트 목록 ({projectStats.planningProjects}개)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f8f8fc]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    프로젝트명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    단계
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    PM
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    회사
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    예상 일정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStats.planningProjectsList.map((project) => (
                  <tr key={project.id} className="hover:bg-[#f8f8fc]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">{project.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.pm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.expected_schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeCategory === "inProgress" && projectStats.inProgressProjectsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <ListChecks className="h-5 w-5 text-[#3a6ea5] mr-2" />
            <h3 className="text-lg font-bold text-[#2d2d3d]">
              진행 중인 프로젝트 목록 ({projectStats.inProgressProjects}개)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-vide-gray-200">
              <thead className="bg-[#f8f8fc]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    프로젝트명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    단계
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    PM
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    회사
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    예상 일정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStats.inProgressProjectsList.map((project) => (
                  <tr key={project.id} className="hover:bg-[#f8f8fc]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">{project.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.pm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.expected_schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeCategory === "completed" && projectStats.completedProjectsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="h-5 w-5 text-[#5a7052] mr-2" />
            <h3 className="text-lg font-bold text-[#2d2d3d]">
              진행완료 프로젝트 목록 ({projectStats.completedProjects}개)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f8f8fc]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    프로젝트명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    단계
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    PM
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    회사
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#4b4b63] uppercase tracking-wider"
                  >
                    예상 일정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStats.completedProjectsList.map((project) => (
                  <tr key={project.id} className="hover:bg-[#f8f8fc]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d3d]">{project.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.pm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6e6e85]">{project.expected_schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 프로젝트 단계별 분포 차트 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-6 w-6 text-[#a5a6f6] mr-2" />
          <h2 className="text-xl font-bold text-[#2d2d3d]">프로젝트 단계별 분포</h2>
        </div>
        <ProjectStageChart data={stageDistributionData} />
      </div>

      {/* 프로젝트 리스트 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0f0f5]">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#a5a6f6]" />
              <Input
                placeholder="프로젝트 검색..."
                className="pl-10 border-[#e9e9f2] bg-[#f8f8fc] focus:bg-white transition-colors rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {/* 새로운 RefreshProjectsButton 컴포넌트 사용 */}
              <RefreshProjectsButton onRefresh={handleRefreshData} variant="outline" size="sm" className="h-10" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 border-[#e9e9f2] text-[#6e6e85] hover:text-[#4b4b63] bg-[#f8f8fc] hover:bg-[#f0f0f8] rounded-lg"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    필터
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg border-[#e9e9f2]">
                  <DropdownMenuItem onClick={() => setSearchTerm("진행중")} className="cursor-pointer">
                    진행 중인 프로젝트
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("진행완료")} className="cursor-pointer">
                    완료된 프로젝트
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("진행보류")} className="cursor-pointer">
                    진행보류 프로젝트
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f8fc] hover:bg-[#f8f8fc]">
                <TableHead className="w-[250px] font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("title")}>
                    프로젝트명
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "title" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("status")}>
                    상태
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "status" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("stage")}>
                    단계
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "stage" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("pm")}>
                    PM
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "pm" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("company")}>
                    회사
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "company" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("stakeholder")}>
                    이해관계자
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "stakeholder" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63] text-center">
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => requestSort("training")}
                  >
                    교육
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63] text-center">
                  <div className="flex items-center justify-center cursor-pointer" onClick={() => requestSort("genai")}>
                    생성형 AI
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63] text-center">
                  <div
                    className="flex items-center justify-center cursor-pointer"
                    onClick={() => requestSort("digital_output")}
                  >
                    디지털 산출물
                  </div>
                </TableHead>
                <TableHead className="font-medium text-[#4b4b63]">
                  <div className="flex items-center cursor-pointer" onClick={() => requestSort("expected_schedule")}>
                    <Calendar className="h-4 w-4 mr-1" />
                    예상 일정
                    <ArrowUpDown
                      className={`ml-1 h-4 w-4 transition-opacity ${sortConfig.key === "expected_schedule" ? "opacity-100 text-[#a5a6f6]" : "opacity-40"}`}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((project) => (
                  <TableRow key={project.id} className="group hover:bg-[#f8f8fc] transition-colors">
                    <TableCell className="font-medium text-[#2d2d3d]">{project.title}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{getStageBadge(project.stage)}</TableCell>
                    <TableCell className="text-[#6e6e85]">{project.pm}</TableCell>
                    <TableCell>{getCompanyBadge(project.company)}</TableCell>
                    <TableCell className="text-[#6e6e85]">{project.stakeholder}</TableCell>
                    <TableCell className="text-center">{renderBoolean(project.training)}</TableCell>
                    <TableCell className="text-center">{renderBoolean(project.genai)}</TableCell>
                    <TableCell className="text-center">{renderBoolean(project.digital_output)}</TableCell>
                    <TableCell className="text-[#6e6e85]">{project.expected_schedule}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          >
                            <MoreHorizontal className="h-4 w-4 text-[#a5a6f6]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg border-[#e9e9f2]">
                          <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-2 text-[#a5a6f6]" />
                            상세 정보
                          </DropdownMenuItem>
                          {project.project_doc && (
                            <DropdownMenuItem className="cursor-pointer">
                              <a
                                href={project.project_doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center w-full"
                              >
                                프로젝트 문서
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12 text-[#6e6e85]">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-5 border-t border-[#f0f0f5] text-sm text-[#6e6e85] bg-[#f8f8fc]">
          <div className="flex justify-between items-center">
            <div>
              총 {sortedProjects.length}개 프로젝트 (전체 {projects.length}개 중)
              {lastUpdated && <span className="ml-4">최근 업데이트: {lastUpdated}</span>}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
