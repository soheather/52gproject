"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Supabase 인증 관련 코드를 제거하고 더미 컨텍스트로 대체
interface AuthContextType {
  user: null
  session: null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async () => {
    throw new Error("인증 기능이 비활성화되었습니다.")
  }

  const signUp = async () => {
    throw new Error("인증 기능이 비활성화되었습니다.")
  }

  const signOut = async () => {
    throw new Error("인증 기능이 비활성화되었습니다.")
  }

  const value = {
    user: null,
    session: null,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
