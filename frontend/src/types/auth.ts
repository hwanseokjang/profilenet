// 사용자 정보
export interface User {
  id: string;           // 사용자 ID (unique)
  email: string;        // 이메일
  name: string;         // 사용자 이름
  createdAt: string;    // 계정 생성일
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답
export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error_code?: string;
}

// 로그아웃 요청/응답
export interface LogoutResponse {
  success: boolean;
  message?: string;
}
