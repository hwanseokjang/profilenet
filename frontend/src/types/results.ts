// ===================================
// 결과 확인 페이지 데이터 타입
// ===================================

/**
 * 네트워크 그래프 노드 타입
 */
export type NodeType = 'subject' | 'relation' | 'expression';

/**
 * 네트워크 그래프 노드
 */
export interface NetworkNode {
  id: string;
  type: NodeType;
  groupName: string;
  label: string;
  color: string;
}

/**
 * 네트워크 그래프 엣지
 */
export interface NetworkEdge {
  id: string;
  source: string; // 노드 ID
  target: string; // 노드 ID
  label?: string;
}

/**
 * 네트워크 그래프 데이터
 */
export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

/**
 * 키워드 정보
 */
export interface KeywordInfo {
  id: string;
  name: string;
  query: string;
}

/**
 * 키워드별 버즈량 데이터
 */
export interface KeywordBuzzData {
  keywordId: string;
  keywordName: string;
  buzzCount: number;
  percentage: number;
}

/**
 * 주제어+연관어 PAIR 버즈량 데이터
 */
export interface KeywordPairBuzzData {
  subjectKeywordId: string;
  subjectKeywordName: string;
  relationKeywordId: string;
  relationKeywordName: string;
  buzzCount: number;
  percentage: number;
}

/**
 * 일자별 추이 데이터
 */
export interface DailyTrendData {
  date: string; // YYYY-MM-DD
  [keywordId: string]: number | string; // 키워드별 버즈량
}

/**
 * 원문 문서
 */
export interface OriginalDocument {
  id: string;
  title: string;
  content: string;
  url?: string;
  domain: string;
  publishedAt: string;
  keywords: string[]; // 연관된 키워드들
  // Expression 노드 전용 (선택) - 감성별 표현 (한 문서에 여러 감성 표현 가능)
  expressions?: Partial<Record<SentimentType, string>>;
  subjectKeywordName?: string;
  relationKeywordName?: string;
}

/**
 * Subject 노드 상세 데이터
 */
export interface SubjectNodeDetail {
  groupId: string;
  groupName: string;
  keywords: KeywordInfo[];
  buzzData: KeywordBuzzData[];
  trendData: DailyTrendData[];
  documents: OriginalDocument[];
}

/**
 * Relation 노드 상세 데이터
 */
export interface RelationNodeDetail {
  groupId: string;
  groupName: string;
  edgeName: string;
  subjectKeywords: KeywordInfo[];
  relationKeywords: KeywordInfo[];
  buzzData: KeywordPairBuzzData[]; // 주제어+연관어 PAIR 버즈 데이터
  trendData: DailyTrendData[];
  documents: OriginalDocument[];
}

/**
 * 표현 감성 타입
 */
export type SentimentType = '긍정' | '부정' | '중립' | '종합';

/**
 * 표현 버즈 데이터
 */
export interface ExpressionBuzzData {
  expression: string;
  subjectKeywordId?: string;
  subjectKeywordName?: string;
  relationKeywordId?: string;
  relationKeywordName?: string;
  긍정: number;
  부정: number;
  중립: number;
  종합: number;
}

/**
 * 클러스터 데이터
 */
export interface ClusterData {
  clusterId: string;
  clusterName: string;
  expressionCount: number;
  documentCount: number;
  topExpressions: string[];
}

/**
 * Expression 노드 상세 데이터
 */
export interface ExpressionNodeDetail {
  groupId: string;
  groupName: string;
  textType: '서술형' | '단답형';
  availableSentiments: SentimentType[];
  subjectKeywords?: KeywordInfo[];
  relationKeywords?: KeywordInfo[];
  buzzData: ExpressionBuzzData[];
  clusterData: ClusterData[];
  documents: OriginalDocument[];
}

/**
 * 분석 가능한 기간 정보
 */
export interface AvailablePeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string; // 표시용 레이블 (예: "25.12.01~25.12.31")
}

/**
 * 전체 결과 데이터
 */
export interface AnalysisResultsData {
  projectId: string;
  projectName: string;
  availablePeriods: AvailablePeriod[];
  networkGraph: NetworkGraphData;
  // 노드별 상세 데이터는 클릭 시 별도 API로 조회
}

/**
 * 노드 상세 데이터 요청
 */
export interface NodeDetailRequest {
  projectId: string;
  nodeId: string;
  period: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 노드 상세 데이터 응답
 */
export interface NodeDetailResponse {
  success: boolean;
  nodeType: NodeType;
  data: SubjectNodeDetail | RelationNodeDetail | ExpressionNodeDetail;
  message?: string;
}
