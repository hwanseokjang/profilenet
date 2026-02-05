// ===================================
// 분석 시작 API (Start Analysis)
// ===================================

// 키워드 정보 (API 요청용)
export interface ApiKeyword {
  id: string;           // 이름, 쿼리, 설명, 조건을 기반으로 생성된 ID
  name: string;         // 키워드 이름 (예: "OB맥주")
  query: string;        // 검색 쿼리 (예: "OB&&(맥주||캔||비어||beer)")
  info: string;         // 설명
}

// 표현 분석 설정 (API 요청용)
export interface ApiAnalysisExpression {
  id: string;                   // 이름, 타입, 분석 설정, 조건으로 생성된 ID
  group_name: string;           // 표현 이름 (예: "먹을 때의 맛 표현")
  text_type: string;            // 생성 타입 (예: "서술형", "단답형")
  pool_size: number;            // 분석 개수 (0 = 무제한)
  analysis_methods: string[];   // 표현 종류 (예: ["긍정", "부정", "종합"])
  analysis_guide: string;       // 생성 조건
}

// 연관어 설정 (API 요청용)
export interface ApiRelation {
  group_name: string;                   // 연관어 이름 (예: "기분/상황")
  edge_name: string;                    // 관계명 (예: "먹을 때의 기분/상황")
  keywords: ApiKeyword[];               // 키워드 목록
  relation_guide: string;               // 필터링 조건
  analyses: ApiAnalysisExpression[];    // 표현 분석 목록
}

// 주제어 설정 (API 요청용)
export interface ApiSubject {
  group_name: string;                   // 주제어 이름 (예: "국내 맥주")
  keywords: ApiKeyword[];               // 키워드 목록
  filter_guide: string;                 // 필터링 조건
  relations: ApiRelation[];             // 연관어 목록
  analyses: ApiAnalysisExpression[];    // 직접 표현 분석 목록
}

// 데이터 도메인 정보
export interface ApiDataDomain {
  domain: string;   // 도메인 (예: "ko.naver_blog", "instagram", "news")
  type: string;     // 타입 (예: "text", "image")
}

// ===================================
// 분석 시작 API 요청 (Request)
// ===================================
export interface StartAnalysisRequest {
  id: string;                   // 프로젝트 그룹 ID
  name: string;                 // 프로젝트 이름
  data: ApiDataDomain[];        // 분석 도메인 정보 및 타입
  start_date: string;           // 시작일 (YYYY-MM-DD)
  end_date: string;             // 종료일 (YYYY-MM-DD)
  subjects: ApiSubject[];       // 주제어 목록
}

// ===================================
// 분석 시작 API 응답 (Response)
// ===================================
export interface StartAnalysisResponse {
  success: boolean;             // 등록 성공 여부
  message: string;              // 결과 메시지
  request_id?: string;          // 요청 ID (성공 시)
  error_code?: string;          // 에러 코드 (실패 시)
  error_details?: string;       // 상세 에러 메시지 (실패 시)
}


// ===================================
// 분석 모니터링 API (Monitoring)
// ===================================

// 모니터링 API 요청 (Request)
export interface MonitoringRequest {
  id: string;   // 프로젝트 그룹 ID
}

// 개별 분석 진행 상태
export interface AnalysisProgress {
  subject_name: string;         // 주제어 이름
  keyword_name: string;         // 키워드 이름
  domain: string;               // 도메인
  type: string;                 // 타입 (text/image)
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;             // 진행률 (0-100)
  processed_count: number;      // 처리된 문서 수
  total_count: number;          // 전체 문서 수
  error_message?: string;       // 에러 메시지 (실패 시)
}

// 모니터링 API 응답 (Response)
export interface MonitoringResponse {
  success: boolean;                 // 조회 성공 여부
  id: string;                       // 프로젝트 그룹 ID
  name: string;                     // 프로젝트 이름
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped';
  overall_progress: number;         // 전체 진행률 (0-100)
  started_at?: string;              // 분석 시작 시간
  estimated_completion?: string;    // 예상 완료 시간
  analyses: AnalysisProgress[];     // 개별 분석 진행 상태
  message?: string;                 // 상태 메시지
  error_code?: string;              // 에러 코드 (실패 시)
}


// ===================================
// 도메인 코드 매핑
// ===================================
export const DOMAIN_CODES: Record<string, string> = {
  blog: 'ko.naver_blog',
  instagram: 'instagram',
  news: 'ko.news',
};

export const DOMAIN_LABELS: Record<string, string> = {
  'ko.naver_blog': '네이버 블로그',
  instagram: '인스타그램',
  'ko.news': '뉴스',
  blog: '블로그',
  news: '뉴스',
};

export const TYPE_LABELS: Record<string, string> = {
  text: 'TEXT',
  image: '이미지',
};

// 분석 메서드 한글 매핑
export const ANALYSIS_METHOD_LABELS: Record<string, string> = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립',
  comprehensive: '종합',
};

// 텍스트 타입 한글 매핑
export const TEXT_TYPE_LABELS: Record<string, string> = {
  narrative: '서술형',
  short: '단답형',
};
