/**
 * 필요한 환경 변수가 설정되어 있는지 확인하는 함수
 * @param requiredVars 필요한 환경 변수 목록
 * @returns 설정되지 않은 환경 변수 목록
 */
export function checkRequiredEnvVars(requiredVars: string[]): string[] {
  const missingVars: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  return missingVars
}

/**
 * 모든 필요한 환경 변수가 설정되어 있는지 확인하는 함수
 * @param requiredVars 필요한 환경 변수 목록
 * @returns 모든 환경 변수가 설정되어 있으면 true, 아니면 false
 */
export function areAllEnvVarsSet(requiredVars: string[]): boolean {
  return checkRequiredEnvVars(requiredVars).length === 0
}
