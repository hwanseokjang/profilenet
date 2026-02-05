import type { AnalysisProject } from '../types/analysis';
import type {
  StartAnalysisRequest,
  StartAnalysisResponse,
  MonitoringRequest,
  MonitoringResponse,
  ApiSubject,
  ApiRelation,
  ApiAnalysisExpression,
  ApiKeyword,
  ApiDataDomain,
  AnalysisProgress,
} from '../types/api';
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
} from '../types/auth';
import type {
  AnalysisResultsData,
  NodeDetailRequest,
  NodeDetailResponse,
  SubjectNodeDetail,
  RelationNodeDetail,
  ExpressionNodeDetail,
} from '../types/results';
import {
  DOMAIN_CODES,
  ANALYSIS_METHOD_LABELS,
  TEXT_TYPE_LABELS,
} from '../types/api';
import {
  generateSubjectId,
  generateRelationId,
  generateAnalysisId,
  generateKeywordId,
} from '../utils/idGenerator';

// ===================================
// 프로젝트 데이터 → API 요청 변환
// ===================================

/**
 * 프론트엔드 프로젝트 데이터를 API 요청 형식으로 변환
 * content-based ID를 생성하여 사용
 */
export async function convertProjectToApiRequest(project: AnalysisProject): Promise<StartAnalysisRequest> {
  // Subject들을 content-based ID로 변환
  const subjects: ApiSubject[] = await Promise.all(
    project.subjects.map(async (subject) => {
      // Subject ID 생성
      const subjectId = await generateSubjectId(
        subject.group_name,
        subject.keywords,
        subject.filter_guide
      );

      // Keyword들의 ID 생성
      const keywords: ApiKeyword[] = await Promise.all(
        subject.keywords.map(async (kw) => ({
          id: await generateKeywordId(kw.name, kw.query, kw.info),
          name: kw.name,
          query: kw.query,
          info: kw.info,
        }))
      );

      // Relation들 변환
      const relations: ApiRelation[] = await Promise.all(
        subject.relations.map(async (relation) => {
          const relationId = await generateRelationId(
            relation.group_name,
            relation.edge_name,
            relation.keywords,
            relation.relation_guide
          );

          const relKeywords: ApiKeyword[] = await Promise.all(
            relation.keywords.map(async (kw) => ({
              id: await generateKeywordId(kw.name, kw.query, kw.info),
              name: kw.name,
              query: kw.query,
              info: kw.info,
            }))
          );

          const analyses: ApiAnalysisExpression[] = await Promise.all(
            relation.analyses.map(async (ana) => ({
              id: await generateAnalysisId(
                ana.group_name,
                ana.text_type,
                ana.analysis_methods,
                ana.pool_size,
                ana.analysis_guide
              ),
              group_name: ana.group_name,
              text_type: TEXT_TYPE_LABELS[ana.text_type] || ana.text_type,
              pool_size: ana.pool_size,
              analysis_methods: ana.analysis_methods.map((m) => ANALYSIS_METHOD_LABELS[m] || m),
              analysis_guide: ana.analysis_guide,
            }))
          );

          return {
            group_name: relation.group_name,
            edge_name: relation.edge_name,
            keywords: relKeywords,
            relation_guide: relation.relation_guide,
            analyses,
          };
        })
      );

      // Subject의 직접 분석들
      const analyses: ApiAnalysisExpression[] = await Promise.all(
        subject.analyses.map(async (ana) => ({
          id: await generateAnalysisId(
            ana.group_name,
            ana.text_type,
            ana.analysis_methods,
            ana.pool_size,
            ana.analysis_guide
          ),
          group_name: ana.group_name,
          text_type: TEXT_TYPE_LABELS[ana.text_type] || ana.text_type,
          pool_size: ana.pool_size,
          analysis_methods: ana.analysis_methods.map((m) => ANALYSIS_METHOD_LABELS[m] || m),
          analysis_guide: ana.analysis_guide,
        }))
      );

      return {
        group_name: subject.group_name,
        keywords,
        filter_guide: subject.filter_guide,
        relations,
        analyses,
      };
    })
  );

  const data: ApiDataDomain[] = project.data.map((d) => ({
    domain: DOMAIN_CODES[d.domain] || d.domain,
    type: d.type,
  }));

  return {
    id: project.id,
    name: project.name,
    data,
    start_date: project.start_date,
    end_date: project.end_date,
    subjects,
  };
}


// ===================================
// API 엔드포인트 설정
// ===================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Mock 모드 여부 (실제 API 연결 전 테스트용)
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'true';


// ===================================
// 분석 시작 API
// ===================================

/**
 * 분석 시작 요청
 */
export async function startAnalysisApi(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
  if (USE_MOCK) {
    return mockStartAnalysis(request);
  }

  const response = await fetch(`${API_BASE_URL}/analysis/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      message: '분석 시작에 실패했습니다.',
      error_code: `HTTP_${response.status}`,
      error_details: error.message || response.statusText,
    };
  }

  return response.json();
}

/**
 * Mock: 분석 시작 요청 처리
 */
function mockStartAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
  console.log('=== Mock API: Start Analysis ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      // 유효성 검사
      if (!request.id) {
        resolve({
          success: false,
          message: '프로젝트 ID가 필요합니다.',
          error_code: 'INVALID_REQUEST',
          error_details: 'Missing project ID',
        });
        return;
      }

      if (request.subjects.length === 0) {
        resolve({
          success: false,
          message: '최소 1개의 주제어가 필요합니다.',
          error_code: 'INVALID_REQUEST',
          error_details: 'No subjects defined',
        });
        return;
      }

      if (request.data.length === 0) {
        resolve({
          success: false,
          message: '최소 1개의 데이터 소스가 필요합니다.',
          error_code: 'INVALID_REQUEST',
          error_details: 'No data sources selected',
        });
        return;
      }

      // 성공 응답
      resolve({
        success: true,
        message: '분석이 성공적으로 시작되었습니다.',
        request_id: `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      });
    }, 500); // 500ms 지연으로 API 호출 시뮬레이션
  });
}


// ===================================
// 분석 모니터링 API
// ===================================

/**
 * 분석 진행 상황 조회
 */
export async function getAnalysisMonitoringApi(request: MonitoringRequest): Promise<MonitoringResponse> {
  if (USE_MOCK) {
    return mockGetMonitoring(request);
  }

  const response = await fetch(`${API_BASE_URL}/analysis/monitoring?id=${encodeURIComponent(request.id)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      id: request.id,
      name: '',
      status: 'failed',
      overall_progress: 0,
      analyses: [],
      error_code: `HTTP_${response.status}`,
      message: error.message || response.statusText,
    };
  }

  return response.json();
}

// Mock 모니터링 상태 저장 (테스트용)
const mockMonitoringState: Map<string, {
  progress: number;
  startTime: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped';
}> = new Map();

/**
 * Mock: 분석 진행 상황 조회 처리
 */
function mockGetMonitoring(request: MonitoringRequest): Promise<MonitoringResponse> {
  console.log('=== Mock API: Get Monitoring ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      // 상태 초기화 또는 조회
      let state = mockMonitoringState.get(request.id);
      if (!state) {
        state = {
          progress: 0,
          startTime: Date.now(),
          status: 'processing',
        };
        mockMonitoringState.set(request.id, state);
      }

      // 진행률 증가 (테스트용 - 매 호출마다 10% 증가)
      if (state.status === 'processing') {
        state.progress = Math.min(100, state.progress + Math.random() * 15 + 5);
        if (state.progress >= 100) {
          state.progress = 100;
          state.status = 'completed';
        }
      }

      // 개별 분석 진행 상태 생성 (테스트용)
      const analyses: AnalysisProgress[] = [
        {
          subject_name: '국내 맥주',
          keyword_name: 'OB맥주',
          domain: 'ko.naver_blog',
          type: 'text',
          status: state.progress >= 30 ? 'completed' : 'processing',
          progress: Math.min(100, state.progress * 1.5),
          processed_count: Math.floor(state.progress * 12),
          total_count: 1200,
        },
        {
          subject_name: '국내 맥주',
          keyword_name: '카스',
          domain: 'ko.naver_blog',
          type: 'text',
          status: state.progress >= 60 ? 'completed' : state.progress >= 30 ? 'processing' : 'pending',
          progress: Math.max(0, Math.min(100, (state.progress - 30) * 1.5)),
          processed_count: Math.floor(Math.max(0, state.progress - 30) * 8),
          total_count: 800,
        },
        {
          subject_name: '국내 맥주',
          keyword_name: '하이트',
          domain: 'instagram',
          type: 'text',
          status: state.progress >= 100 ? 'completed' : state.progress >= 60 ? 'processing' : 'pending',
          progress: Math.max(0, Math.min(100, (state.progress - 60) * 2.5)),
          processed_count: Math.floor(Math.max(0, state.progress - 60) * 5),
          total_count: 500,
        },
      ];

      resolve({
        success: true,
        id: request.id,
        name: '맥주 브랜드 분석',
        status: state.status,
        overall_progress: Math.round(state.progress),
        started_at: new Date(state.startTime).toISOString(),
        estimated_completion: state.status === 'completed'
          ? new Date().toISOString()
          : new Date(Date.now() + (100 - state.progress) * 1000).toISOString(),
        analyses,
        message: state.status === 'completed'
          ? '분석이 완료되었습니다.'
          : `분석 진행 중... (${Math.round(state.progress)}%)`,
      });
    }, 300);
  });
}

/**
 * Mock 상태 초기화 (테스트용)
 */
export function resetMockMonitoringState(projectId: string): void {
  mockMonitoringState.delete(projectId);
}

/**
 * Mock 상태 설정 (테스트용)
 */
export function setMockMonitoringState(
  projectId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped',
  progress: number = 0
): void {
  mockMonitoringState.set(projectId, {
    progress,
    startTime: Date.now(),
    status,
  });
}


// ===================================
// 인증 API (Authentication)
// ===================================

/**
 * 로그인
 */
export async function loginApi(request: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockLogin(request);
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      message: '로그인에 실패했습니다.',
      error_code: `HTTP_${response.status}`,
    };
  }

  return response.json();
}

/**
 * Mock: 로그인
 */
function mockLogin(request: LoginRequest): Promise<LoginResponse> {
  console.log('=== Mock API: Login ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      // 간단한 테스트 계정
      if (request.email === 'test@example.com' && request.password === 'test123') {
        resolve({
          success: true,
          user: {
            id: 'user_test_001',
            email: 'test@example.com',
            name: '테스트 사용자',
            createdAt: new Date().toISOString(),
          },
          token: 'mock_token_' + Date.now(),
        });
      } else {
        resolve({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          error_code: 'INVALID_CREDENTIALS',
        });
      }
    }, 500);
  });
}

/**
 * 로그아웃
 */
export async function logoutApi(): Promise<LogoutResponse> {
  if (USE_MOCK) {
    return mockLogout();
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return {
      success: false,
      message: '로그아웃에 실패했습니다.',
    };
  }

  return response.json();
}

/**
 * Mock: 로그아웃
 */
function mockLogout(): Promise<LogoutResponse> {
  console.log('=== Mock API: Logout ===');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '로그아웃되었습니다.',
      });
    }, 300);
  });
}


// ===================================
// 분석 중지 API (Stop Analysis)
// ===================================

export interface StopAnalysisRequest {
  id: string;  // 프로젝트 ID
}

export interface StopAnalysisResponse {
  success: boolean;
  message: string;
  error_code?: string;
}

/**
 * 분석 중지
 */
export async function stopAnalysisApi(request: StopAnalysisRequest): Promise<StopAnalysisResponse> {
  if (USE_MOCK) {
    return mockStopAnalysis(request);
  }

  const response = await fetch(`${API_BASE_URL}/analysis/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      message: '분석 중지에 실패했습니다.',
      error_code: `HTTP_${response.status}`,
    };
  }

  return response.json();
}

/**
 * Mock: 분석 중지
 */
function mockStopAnalysis(request: StopAnalysisRequest): Promise<StopAnalysisResponse> {
  console.log('=== Mock API: Stop Analysis ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock 상태 업데이트
      const state = mockMonitoringState.get(request.id);
      if (state) {
        state.status = 'stopped';
        mockMonitoringState.set(request.id, state);
      }

      resolve({
        success: true,
        message: '분석이 중지되었습니다.',
      });
    }, 500);
  });
}


// ===================================
// 분석 결과 확인 API (Get Results)
// ===================================

export interface GetResultsRequest {
  id: string;  // 프로젝트 ID
}

export interface GetResultsResponse {
  success: boolean;
  id: string;
  results_url?: string;  // 결과 페이지 URL
  message?: string;
  error_code?: string;
}

/**
 * 분석 결과 확인
 */
export async function getResultsApi(request: GetResultsRequest): Promise<GetResultsResponse> {
  if (USE_MOCK) {
    return mockGetResults(request);
  }

  const response = await fetch(`${API_BASE_URL}/analysis/results?id=${encodeURIComponent(request.id)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      id: request.id,
      message: '결과 조회에 실패했습니다.',
      error_code: `HTTP_${response.status}`,
    };
  }

  return response.json();
}

/**
 * Mock: 분석 결과 확인
 */
function mockGetResults(request: GetResultsRequest): Promise<GetResultsResponse> {
  console.log('=== Mock API: Get Results ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      const state = mockMonitoringState.get(request.id);

      if (!state || state.status !== 'completed') {
        resolve({
          success: false,
          id: request.id,
          message: '분석이 완료되지 않았습니다.',
          error_code: 'NOT_COMPLETED',
        });
        return;
      }

      resolve({
        success: true,
        id: request.id,
        results_url: `/results/${request.id}`,
        message: '결과 페이지로 이동합니다.',
      });
    }, 300);
  });
}


// ===================================
// 분석 로그 조회 API (Get Analysis Logs)
// ===================================

export interface GetAnalysisLogsRequest {
  userId: string;  // 사용자 ID
  projectId?: string;  // 특정 프로젝트 필터 (선택사항)
}

export interface AnalysisLogItem {
  id: string;
  projectId: string;
  projectName: string;
  period: string;
  domain: string;
  analysisType: string;
  progress: number;
  status: 'analyzing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt: string | null;
}

export interface GetAnalysisLogsResponse {
  success: boolean;
  userId: string;
  logs: AnalysisLogItem[];
  message?: string;
  error_code?: string;
}

/**
 * 분석 로그 조회 (사용자 ID 기반)
 */
export async function getAnalysisLogsApi(request: GetAnalysisLogsRequest): Promise<GetAnalysisLogsResponse> {
  if (USE_MOCK) {
    return mockGetAnalysisLogs(request);
  }

  const url = new URL(`${API_BASE_URL}/analysis/logs`);
  url.searchParams.append('userId', request.userId);
  if (request.projectId) {
    url.searchParams.append('projectId', request.projectId);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      userId: request.userId,
      logs: [],
      message: '로그 조회에 실패했습니다.',
      error_code: `HTTP_${response.status}`,
    };
  }

  return response.json();
}

/**
 * Mock: 분석 로그 조회
 */
function mockGetAnalysisLogs(request: GetAnalysisLogsRequest): Promise<GetAnalysisLogsResponse> {
  console.log('=== Mock API: Get Analysis Logs ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock 데이터 - 실제로는 서버에서 userId로 필터링된 로그 반환
      const mockLogs: AnalysisLogItem[] = [
        {
          id: 'log-1',
          projectId: 'demo_user_1733400000000_ghi789',
          projectName: '스킨케어 제품 분석',
          period: '25.12.01~25.12.15',
          domain: '인스타그램',
          analysisType: '텍스트',
          progress: 100,
          status: 'completed',
          requestedAt: '2025-12-20T10:00:00Z',
          completedAt: '2025-12-20T12:30:00Z',
        },
        {
          id: 'log-2',
          projectId: 'demo_user_1733400000000_ghi789',
          projectName: '스킨케어 제품 분석',
          period: '25.12.16~25.12.20',
          domain: '인스타그램',
          analysisType: '텍스트',
          progress: 65,
          status: 'analyzing',
          requestedAt: '2025-12-20T14:00:00Z',
          completedAt: null,
        },
        {
          id: 'log-3',
          projectId: 'demo_user_1733054400000_abc123',
          projectName: '맥주 브랜드 분석',
          period: '25.01.01~25.01.31',
          domain: '블로그',
          analysisType: '텍스트',
          progress: 100,
          status: 'completed',
          requestedAt: '2025-12-15T10:00:00Z',
          completedAt: '2025-12-15T14:30:00Z',
        },
      ];

      // projectId 필터링
      const filteredLogs = request.projectId
        ? mockLogs.filter((log) => log.projectId === request.projectId)
        : mockLogs;

      resolve({
        success: true,
        userId: request.userId,
        logs: filteredLogs,
        message: '로그 조회 완료',
      });
    }, 300);
  });
}


// ===================================
// 분석 결과 조회 API (Analysis Results)
// ===================================

export interface GetAnalysisResultsRequest {
  projectId: string;
  period?: {
    startDate: string;
    endDate: string;
  };
}

export interface GetAnalysisResultsResponse {
  success: boolean;
  data?: AnalysisResultsData;
  message?: string;
  error_code?: string;
}

/**
 * 분석 결과 데이터 조회 (네트워크 그래프 + 가능한 기간)
 */
export async function getAnalysisResultsApi(
  request: GetAnalysisResultsRequest
): Promise<GetAnalysisResultsResponse> {
  if (USE_MOCK) {
    return mockGetAnalysisResults(request);
  }

  const url = new URL(`${API_BASE_URL}/analysis/results/data`);
  url.searchParams.append('projectId', request.projectId);
  if (request.period) {
    url.searchParams.append('startDate', request.period.startDate);
    url.searchParams.append('endDate', request.period.endDate);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      message: '결과 데이터 조회에 실패했습니다.',
      error_code: `HTTP_${response.status}`,
    };
  }

  return response.json();
}

/**
 * Mock: 분석 결과 데이터 조회
 */
function mockGetAnalysisResults(
  request: GetAnalysisResultsRequest
): Promise<GetAnalysisResultsResponse> {
  console.log('=== Mock API: Get Analysis Results ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      // 맥주 브랜드 분석 프로젝트 (demo_user_1733054400000_abc123)
      if (request.projectId === 'demo_user_1733054400000_abc123') {
        resolve({
          success: true,
          data: {
            projectId: request.projectId,
            projectName: '맥주 브랜드 분석',
            availablePeriods: [
              {
                startDate: '2025-01-01',
                endDate: '2025-01-31',
                label: '25.01.01~25.01.31',
              },
            ],
            networkGraph: {
              nodes: [
                // 주제어 그룹들
                {
                  id: 'subject-1',
                  type: 'subject',
                  groupName: '국내 맥주',
                  label: '국내 맥주',
                  color: '#3b82f6',
                },
                {
                  id: 'subject-2',
                  type: 'subject',
                  groupName: '수입 맥주',
                  label: '수입 맥주',
                  color: '#2563eb',
                },
                // 연관어 그룹들
                {
                  id: 'relation-1',
                  type: 'relation',
                  groupName: '시기/상황',
                  label: '시기/상황',
                  color: '#8b5cf6',
                },
                {
                  id: 'relation-2',
                  type: 'relation',
                  groupName: '음식 페어링',
                  label: '음식 페어링',
                  color: '#7c3aed',
                },
                // 표현 그룹들
                {
                  id: 'expression-1',
                  type: 'expression',
                  groupName: '맛 표현',
                  label: '맛 표현',
                  color: '#14b8a6',
                },
                {
                  id: 'expression-2',
                  type: 'expression',
                  groupName: '향 표현',
                  label: '향 표현',
                  color: '#0d9488',
                },
              ],
              edges: [
                // 국내 맥주 관계
                {
                  id: 'edge-1',
                  source: 'subject-1',
                  target: 'relation-1',
                },
                {
                  id: 'edge-2',
                  source: 'subject-1',
                  target: 'relation-2',
                },
                {
                  id: 'edge-3',
                  source: 'relation-1',
                  target: 'expression-1',
                },
                {
                  id: 'edge-4',
                  source: 'relation-2',
                  target: 'expression-1',
                },
                // 수입 맥주 관계
                {
                  id: 'edge-5',
                  source: 'subject-2',
                  target: 'relation-1',
                },
                {
                  id: 'edge-6',
                  source: 'subject-2',
                  target: 'relation-2',
                },
                {
                  id: 'edge-7',
                  source: 'relation-1',
                  target: 'expression-2',
                },
                {
                  id: 'edge-8',
                  source: 'relation-2',
                  target: 'expression-2',
                },
              ],
            },
          },
        });
      }
      // 스킨케어 제품 분석 프로젝트 (demo_user_1733400000000_ghi789)
      else if (request.projectId === 'demo_user_1733400000000_ghi789') {
        resolve({
          success: true,
          data: {
            projectId: request.projectId,
            projectName: '스킨케어 제품 분석',
            availablePeriods: [
              {
                startDate: '2025-12-01',
                endDate: '2025-12-31',
                label: '25.12.01~25.12.31',
              },
            ],
            networkGraph: {
              nodes: [
                {
                  id: 'subject-1',
                  type: 'subject',
                  groupName: '스킨케어 제품',
                  label: '스킨케어 제품',
                  color: '#3b82f6',
                },
                {
                  id: 'relation-1',
                  type: 'relation',
                  groupName: '피부 타입',
                  label: '피부 타입',
                  color: '#8b5cf6',
                },
                {
                  id: 'expression-1',
                  type: 'expression',
                  groupName: '효과 표현',
                  label: '효과 표현',
                  color: '#14b8a6',
                },
              ],
              edges: [
                {
                  id: 'edge-1',
                  source: 'subject-1',
                  target: 'relation-1',
                  label: '사용하는 피부 타입',
                },
                {
                  id: 'edge-2',
                  source: 'relation-1',
                  target: 'expression-1',
                  label: '효과 표현',
                },
              ],
            },
          },
        });
      }
      // 기타 프로젝트 - 기본 샘플 데이터 반환
      else {
        resolve({
          success: true,
          data: {
            projectId: request.projectId,
            projectName: '샘플 분석 프로젝트',
            availablePeriods: [
              {
                startDate: '2025-01-01',
                endDate: '2025-01-31',
                label: '25.01.01~25.01.31',
              },
            ],
            networkGraph: {
              nodes: [
                {
                  id: 'subject-1',
                  type: 'subject',
                  groupName: '국내 맥주',
                  label: '국내 맥주',
                  color: '#3b82f6',
                },
                {
                  id: 'subject-2',
                  type: 'subject',
                  groupName: '수입 맥주',
                  label: '수입 맥주',
                  color: '#2563eb',
                },
                {
                  id: 'relation-1',
                  type: 'relation',
                  groupName: '기분/상황',
                  label: '기분/상황',
                  color: '#8b5cf6',
                },
                {
                  id: 'relation-2',
                  type: 'relation',
                  groupName: '음식 페어링',
                  label: '음식 페어링',
                  color: '#7c3aed',
                },
                {
                  id: 'expression-1',
                  type: 'expression',
                  groupName: '맛 표현',
                  label: '맛 표현',
                  color: '#14b8a6',
                },
                {
                  id: 'expression-2',
                  type: 'expression',
                  groupName: '향 표현',
                  label: '향 표현',
                  color: '#0d9488',
                },
              ],
              edges: [
                // 주제어 → 연관어
                { id: 'edge-1', source: 'subject-1', target: 'relation-1' },
                { id: 'edge-2', source: 'subject-1', target: 'relation-2' },
                { id: 'edge-3', source: 'subject-2', target: 'relation-1' },
                { id: 'edge-4', source: 'subject-2', target: 'relation-2' },
                // 연관어 → 표현
                { id: 'edge-5', source: 'relation-1', target: 'expression-1' },
                { id: 'edge-6', source: 'relation-1', target: 'expression-2' },
                { id: 'edge-7', source: 'relation-2', target: 'expression-1' },
                { id: 'edge-8', source: 'relation-2', target: 'expression-2' },
              ],
            },
          },
        });
      }
    }, 300);
  });
}

/**
 * 노드 상세 데이터 조회
 */
export async function getNodeDetailApi(
  request: NodeDetailRequest
): Promise<NodeDetailResponse> {
  if (USE_MOCK) {
    return mockGetNodeDetail(request);
  }

  const response = await fetch(`${API_BASE_URL}/analysis/results/node-detail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || '노드 상세 데이터 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * Mock: 노드 상세 데이터 조회
 */
function mockGetNodeDetail(request: NodeDetailRequest): Promise<NodeDetailResponse> {
  console.log('=== Mock API: Get Node Detail ===');
  console.log('Request:', JSON.stringify(request, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      // Subject 노드
      if (request.nodeId === 'subject-1') {
        const detail: SubjectNodeDetail = {
          groupId: 'subject-1',
          groupName: '국내 맥주',
          keywords: [
            { id: 'kw-1', name: 'OB맥주', query: 'OB&&(맥주||캔||비어||beer)' },
            { id: 'kw-2', name: '카스', query: '카스&&(맥주||캔||비어||beer)' },
            { id: 'kw-3', name: '하이트', query: '하이트&&(맥주||캔||비어||beer)' },
          ],
          buzzData: [
            { keywordId: 'kw-1', keywordName: 'OB맥주', buzzCount: 1523, percentage: 35.2 },
            { keywordId: 'kw-2', keywordName: '카스', buzzCount: 2145, percentage: 49.6 },
            { keywordId: 'kw-3', keywordName: '하이트', buzzCount: 658, percentage: 15.2 },
          ],
          trendData: [
            { date: '2025-01-01', 'kw-1': 52, 'kw-2': 73, 'kw-3': 21 },
            { date: '2025-01-02', 'kw-1': 48, 'kw-2': 69, 'kw-3': 19 },
            { date: '2025-01-03', 'kw-1': 55, 'kw-2': 78, 'kw-3': 24 },
            { date: '2025-01-04', 'kw-1': 49, 'kw-2': 71, 'kw-3': 22 },
            { date: '2025-01-05', 'kw-1': 53, 'kw-2': 75, 'kw-3': 23 },
          ],
          documents: generateMockDocuments('subject', 50),
        };
        resolve({ success: true, nodeType: 'subject', data: detail });
      }
      // Subject 노드 - 수입 맥주
      else if (request.nodeId === 'subject-2') {
        const detail: SubjectNodeDetail = {
          groupId: 'subject-2',
          groupName: '수입 맥주',
          keywords: [
            { id: 'kw-4', name: '하이네켄', query: '하이네켄&&(맥주||beer)' },
            { id: 'kw-5', name: '버드와이저', query: '버드와이저&&(맥주||beer)' },
            { id: 'kw-6', name: '기네스', query: '기네스&&(맥주||stout)' },
          ],
          buzzData: [
            { keywordId: 'kw-4', keywordName: '하이네켄', buzzCount: 1823, percentage: 45.6 },
            { keywordId: 'kw-5', keywordName: '버드와이저', buzzCount: 1456, percentage: 36.4 },
            { keywordId: 'kw-6', keywordName: '기네스', buzzCount: 719, percentage: 18.0 },
          ],
          trendData: [
            { date: '2025-01-01', 'kw-4': 62, 'kw-5': 49, 'kw-6': 24 },
            { date: '2025-01-02', 'kw-4': 58, 'kw-5': 47, 'kw-6': 23 },
            { date: '2025-01-03', 'kw-4': 65, 'kw-5': 52, 'kw-6': 26 },
            { date: '2025-01-04', 'kw-4': 59, 'kw-5': 48, 'kw-6': 22 },
            { date: '2025-01-05', 'kw-4': 63, 'kw-5': 51, 'kw-6': 25 },
          ],
          documents: generateMockDocuments('subject-imported', 50),
        };
        resolve({ success: true, nodeType: 'subject', data: detail });
      }
      // Relation 노드
      else if (request.nodeId === 'relation-1') {
        const detail: RelationNodeDetail = {
          groupId: 'relation-1',
          groupName: '기분/상황',
          edgeName: '먹을 때의 기분/상황',
          subjectKeywords: [
            { id: 'kw-1', name: 'OB맥주', query: 'OB&&(맥주||캔||비어||beer)' },
            { id: 'kw-2', name: '카스', query: '카스&&(맥주||캔||비어||beer)' },
            { id: 'kw-3', name: '테라', query: '테라&&(맥주||캔||비어||beer)' },
          ],
          relationKeywords: [
            { id: 'rel-kw-1', name: '퇴근 후', query: '퇴근&&(후||하고)' },
            { id: 'rel-kw-2', name: '회식', query: '회식' },
            { id: 'rel-kw-3', name: '혼술', query: '혼자&&마시' },
          ],
          buzzData: [
            // OB맥주 조합
            { subjectKeywordId: 'kw-1', subjectKeywordName: 'OB맥주', relationKeywordId: 'rel-kw-1', relationKeywordName: '퇴근 후', buzzCount: 423, percentage: 20.0 },
            { subjectKeywordId: 'kw-1', subjectKeywordName: 'OB맥주', relationKeywordId: 'rel-kw-2', relationKeywordName: '회식', buzzCount: 312, percentage: 14.7 },
            { subjectKeywordId: 'kw-1', subjectKeywordName: 'OB맥주', relationKeywordId: 'rel-kw-3', relationKeywordName: '혼술', buzzCount: 157, percentage: 7.4 },
            // 카스 조합
            { subjectKeywordId: 'kw-2', subjectKeywordName: '카스', relationKeywordId: 'rel-kw-1', relationKeywordName: '퇴근 후', buzzCount: 611, percentage: 28.8 },
            { subjectKeywordId: 'kw-2', subjectKeywordName: '카스', relationKeywordId: 'rel-kw-2', relationKeywordName: '회식', buzzCount: 411, percentage: 19.4 },
            { subjectKeywordId: 'kw-2', subjectKeywordName: '카스', relationKeywordId: 'rel-kw-3', relationKeywordName: '혼술', buzzCount: 204, percentage: 9.6 },
          ],
          trendData: [
            { date: '2025-01-01', 'rel-kw-1': 34, 'rel-kw-2': 25, 'rel-kw-3': 12 },
            { date: '2025-01-02', 'rel-kw-1': 31, 'rel-kw-2': 22, 'rel-kw-3': 11 },
            { date: '2025-01-03', 'rel-kw-1': 37, 'rel-kw-2': 27, 'rel-kw-3': 13 },
            { date: '2025-01-04', 'rel-kw-1': 33, 'rel-kw-2': 24, 'rel-kw-3': 12 },
            { date: '2025-01-05', 'rel-kw-1': 35, 'rel-kw-2': 26, 'rel-kw-3': 13 },
          ],
          documents: generateMockDocuments('relation', 50),
        };
        resolve({ success: true, nodeType: 'relation', data: detail });
      }
      // Relation 노드 - 음식 페어링
      else if (request.nodeId === 'relation-2') {
        const detail: RelationNodeDetail = {
          groupId: 'relation-2',
          groupName: '음식 페어링',
          edgeName: '잘 어울리는 음식',
          subjectKeywords: [
            { id: 'kw-1', name: 'OB맥주', query: 'OB&&(맥주||캔||비어||beer)' },
            { id: 'kw-2', name: '카스', query: '카스&&(맥주||캔||비어||beer)' },
            { id: 'kw-3', name: '테라', query: '테라&&(맥주||캔||비어||beer)' },
          ],
          relationKeywords: [
            { id: 'rel-kw-4', name: '치킨', query: '치킨' },
            { id: 'rel-kw-5', name: '피자', query: '피자' },
            { id: 'rel-kw-6', name: '삼겹살', query: '삼겹살' },
          ],
          buzzData: [
            // OB맥주 조합
            { subjectKeywordId: 'kw-1', subjectKeywordName: 'OB맥주', relationKeywordId: 'rel-kw-4', relationKeywordName: '치킨', buzzCount: 554, percentage: 28.0 },
            { subjectKeywordId: 'kw-1', subjectKeywordName: 'OB맥주', relationKeywordId: 'rel-kw-5', relationKeywordName: '피자', buzzCount: 127, percentage: 6.4 },
            { subjectKeywordId: 'kw-1', subjectKeywordName: 'OB맥주', relationKeywordId: 'rel-kw-6', relationKeywordName: '삼겹살', buzzCount: 75, percentage: 3.8 },
            // 카스 조합
            { subjectKeywordId: 'kw-2', subjectKeywordName: '카스', relationKeywordId: 'rel-kw-4', relationKeywordName: '치킨', buzzCount: 902, percentage: 45.5 },
            { subjectKeywordId: 'kw-2', subjectKeywordName: '카스', relationKeywordId: 'rel-kw-5', relationKeywordName: '피자', buzzCount: 207, percentage: 10.5 },
            { subjectKeywordId: 'kw-2', subjectKeywordName: '카스', relationKeywordId: 'rel-kw-6', relationKeywordName: '삼겹살', buzzCount: 114, percentage: 5.8 },
          ],
          trendData: [
            { date: '2025-01-01', 'rel-kw-4': 48, 'rel-kw-5': 11, 'rel-kw-6': 6 },
            { date: '2025-01-02', 'rel-kw-4': 46, 'rel-kw-5': 10, 'rel-kw-6': 6 },
            { date: '2025-01-03', 'rel-kw-4': 52, 'rel-kw-5': 12, 'rel-kw-6': 7 },
            { date: '2025-01-04', 'rel-kw-4': 47, 'rel-kw-5': 11, 'rel-kw-6': 6 },
            { date: '2025-01-05', 'rel-kw-4': 49, 'rel-kw-5': 11, 'rel-kw-6': 6 },
          ],
          documents: generateMockDocuments('relation-food', 50),
        };
        resolve({ success: true, nodeType: 'relation', data: detail });
      }
      // Expression 노드
      else if (request.nodeId === 'expression-1') {
        const detail: ExpressionNodeDetail = {
          groupId: 'expression-1',
          groupName: '맛 표현',
          textType: '단답형',
          availableSentiments: ['긍정', '부정', '중립', '종합'],
          buzzData: [
            { expression: '상쾌하다', 긍정: 234, 부정: 12, 중립: 45, 종합: 291 },
            { expression: '시원하다', 긍정: 456, 부정: 23, 중립: 78, 종합: 557 },
            { expression: '쓰다', 긍정: 89, 부정: 145, 중립: 234, 종합: 468 },
            { expression: '깔끔하다', 긍정: 312, 부정: 18, 중립: 56, 종합: 386 },
            { expression: '부드럽다', 긍정: 267, 부정: 34, 중립: 89, 종합: 390 },
          ],
          clusterData: [
            {
              clusterId: 'cluster-1',
              clusterName: '긍정적 청량감',
              expressionCount: 234,
              documentCount: 456,
              topExpressions: ['시원하다', '상쾌하다', '깔끔하다'],
            },
            {
              clusterId: 'cluster-2',
              clusterName: '부드러운 맛',
              expressionCount: 189,
              documentCount: 312,
              topExpressions: ['부드럽다', '목넘김이 좋다', '편하다'],
            },
            {
              clusterId: 'cluster-3',
              clusterName: '쓴맛 관련',
              expressionCount: 156,
              documentCount: 278,
              topExpressions: ['쓰다', '씁쓸하다', '진하다'],
            },
          ],
          documents: generateMockDocuments('expression', 50),
        };
        resolve({ success: true, nodeType: 'expression', data: detail });
      }
      // Expression 노드 - 향 표현
      else if (request.nodeId === 'expression-2') {
        const detail: ExpressionNodeDetail = {
          groupId: 'expression-2',
          groupName: '향 표현',
          textType: '단답형',
          availableSentiments: ['긍정', '부정', '중립', '종합'],
          buzzData: [
            { expression: '고소하다', 긍정: 456, 부정: 12, 중립: 67, 종합: 535 },
            { expression: '향긋하다', 긍정: 334, 부정: 8, 중립: 45, 종합: 387 },
            { expression: '톡 쏘다', 긍정: 123, 부정: 89, 중립: 156, 종합: 368 },
            { expression: '구수하다', 긍정: 267, 부정: 23, 중립: 78, 종합: 368 },
            { expression: '향이 강하다', 긍정: 189, 부정: 67, 중립: 112, 종합: 368 },
          ],
          clusterData: [
            {
              clusterId: 'cluster-4',
              clusterName: '긍정적 향',
              expressionCount: 312,
              documentCount: 567,
              topExpressions: ['고소하다', '향긋하다', '구수하다'],
            },
            {
              clusterId: 'cluster-5',
              clusterName: '강한 향',
              expressionCount: 234,
              documentCount: 423,
              topExpressions: ['톡 쏘다', '향이 강하다', '진하다'],
            },
            {
              clusterId: 'cluster-6',
              clusterName: '부드러운 향',
              expressionCount: 178,
              documentCount: 334,
              topExpressions: ['은은하다', '부드럽다', '편안하다'],
            },
          ],
          documents: generateMockDocuments('expression-scent', 50),
        };
        resolve({ success: true, nodeType: 'expression', data: detail });
      } else {
        resolve({
          success: false,
          nodeType: 'subject',
          data: {} as SubjectNodeDetail,
          message: '노드를 찾을 수 없습니다.',
        });
      }
    }, 500);
  });
}

/**
 * Mock 문서 생성 헬퍼
 */
function generateMockDocuments(type: string, count: number) {
  const documents = [];
  const domains = ['블로그', '인스타그램', '뉴스'];
  const titles = [
    '퇴근 후 한 잔의 여유',
    '친구들과 회식 후기',
    '혼자서도 즐거운 홈술',
    '주말 캠핑에서 맥주 한 잔',
    '치킨과 맥주의 환상 조합',
  ];

  for (let i = 0; i < count; i++) {
    documents.push({
      id: `doc-${type}-${i}`,
      title: titles[i % titles.length] + ` #${i + 1}`,
      content: `이 문서는 ${type} 관련 샘플 문서입니다. 맥주를 마시면서 느낀 감정과 맛에 대한 이야기를 담고 있습니다. 카스는 정말 시원하고 상쾌한 맛이 일품입니다. 퇴근 후 한 잔의 여유를 즐기기에 딱 좋은 것 같아요.`,
      url: `https://example.com/post/${i}`,
      domain: domains[i % domains.length],
      publishedAt: new Date(2025, 0, 1 + (i % 31)).toISOString(),
      keywords: ['맥주', '카스', 'OB맥주'],
    });
  }

  return documents;
}
