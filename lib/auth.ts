// Supabase 인증 관련 코드를 제거하고 더미 함수로 대체

// 로그인 함수
export async function signIn(email: string, password: string) {
  console.warn("Supabase 인증이 비활성화되었습니다.")
  throw new Error("인증 기능이 비활성화되었습니다.")
}

// 로그아웃 함수
export async function signOut() {
  console.warn("Supabase 인증이 비활성화되었습니다.")
  throw new Error("인증 기능이 비활성화되었습니다.")
}

// 현재 사용자 가져오기
export async function getCurrentUser() {
  console.warn("Supabase 인증이 비활성화되었습니다.")
  return null
}

// 회원가입 함수
export async function signUp(email: string, password: string) {
  console.warn("Supabase 인증이 비활성화되었습니다.")
  throw new Error("인증 기능이 비활성화되었습니다.")
}

// 세션 확인
export async function getSession() {
  console.warn("Supabase 인증이 비활성화되었습니다.")
  return null
}
