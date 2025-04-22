// 키워드에 따른 이모지 매핑
const emojiMap: Record<string, string> = {
  // 질문/도움 관련
  질문: "🤔",
  궁금: "🤔",
  어떻게: "🧐",
  도움: "🆘",
  문제: "⚠️",
  오류: "🆘",
  버그: "🆘",
  에러: "🆘",
  긴급: "🆘",

  // 개발 관련
  코드: "💻",
  개발: "👨‍💻",
  프로그래밍: "🖥️",
  서버: "🖧",
  데이터: "📊",
  api: "🔌",
  디자인: "🎨",
  ui: "🖼️",
  ux: "👆",

  // 프로젝트 관련
  프로젝트: "📂",
  일정: "📅",
  계획: "📝",
  회의: "👥",
  협업: "🤝",
  팀: "👨‍👩‍👧‍👦",

  // 기술 관련
  react: "⚛️",
  javascript: "🟨",
  typescript: "🔷",
  node: "🟢",
  next: "▲",
  notion: "📓",
  database: "🗄️",

  // 감정 관련
  어려움: "😫",
  힘들: "😩",
  좋: "😊",
  감사: "🙏",
  부탁: "🙇",
  급해: "🆘",
  빨리: "⚡",

  // 기본 이모지
  default: "😊",
}

/**
 * 텍스트 내용을 분석하여 적절한 이모지를 반환하는 함수
 */
export function getEmojiForContent(content: string): string {
  // 소문자로 변환하여 검사
  const lowerContent = content.toLowerCase()

  // 모든 키워드를 검사하여 매칭되는 이모지 찾기
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowerContent.includes(keyword)) {
      return emoji
    }
  }

  // 매칭되는 키워드가 없으면 기본 이모지 반환
  return emojiMap.default
}
