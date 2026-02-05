// 분석 프로젝트 상태
export type AnalysisStatus = 'unavailable' | 'available' | 'analyzing';

// 데이터 도메인
export interface DataDomain {
  domain: 'blog' | 'instagram' | 'news';
  type: 'text' | 'image';
}

// 키워드
export interface Keyword {
  id: string;
  name: string;
  query: string;
  info: string;
}

// 표현 분석 설정
export interface AnalysisExpression {
  id: string;
  group_name: string;
  edge_name: string;
  text_type: 'narrative' | 'short';  // 서술형 | 단답형
  pool_size: number;
  analysis_methods: ('positive' | 'negative' | 'neutral' | 'comprehensive')[];
  analysis_guide: string;
}

// 연관어 설정
export interface Relation {
  id: string;
  group_name: string;
  edge_name: string;
  keywords: Keyword[];
  relation_guide: string;
  analyses: AnalysisExpression[];
}

// 주제어 설정
export interface Subject {
  id: string;
  group_name: string;
  keywords: Keyword[];
  filter_guide: string;
  relations: Relation[];
  analyses: AnalysisExpression[];
}

// 분석 프로젝트
export interface AnalysisProject {
  id: string;
  name: string;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
  data: DataDomain[];
  start_date: string;
  end_date: string;
  autoUpdate: boolean;
  subjects: Subject[];
}

// 분석 로그 항목
export interface AnalysisLog {
  id: string;
  projectId: string;
  period: string;
  domain: string;
  analysisType: string;
  progress: number;  // 0-100
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt: string | null;
}

// 상태 배지 색상 매핑
export const statusColors: Record<AnalysisStatus, string> = {
  unavailable: '#ef4444',  // 빨간색
  available: '#3b82f6',    // 파란색
  analyzing: '#22c55e',    // 초록색
};

// 상태 라벨 매핑
export const statusLabels: Record<AnalysisStatus, string> = {
  unavailable: '불가능',
  available: '가능',
  analyzing: '분석 중',
};
