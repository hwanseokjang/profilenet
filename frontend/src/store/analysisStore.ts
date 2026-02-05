import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  AnalysisProject,
  AnalysisStatus,
  Subject,
  Relation,
  AnalysisExpression,
  Keyword,
  AnalysisLog,
  DataDomain,
} from '../types/analysis';
import {
  generateProjectId,
  generateSubjectId,
  generateRelationId,
  generateAnalysisId,
  generateKeywordId,
} from '../utils/idGenerator';
import { useAuthStore } from './authStore';

interface AnalysisStore {
  projects: AnalysisProject[];
  logs: AnalysisLog[];
  selectedProjectId: string | null;

  // 프로젝트 CRUD
  createProject: (name: string) => string;
  updateProject: (id: string, updates: Partial<AnalysisProject>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => AnalysisProject | undefined;

  // 상태 변경
  setProjectStatus: (id: string, status: AnalysisStatus) => void;
  startAnalysis: (id: string, data: DataDomain[], startDate: string, endDate: string, autoUpdate: boolean) => void;
  stopAnalysis: (id: string) => void;

  // 주제어 관리
  addSubject: (projectId: string) => void;
  updateSubject: (projectId: string, subjectId: string, updates: Partial<Subject>) => void;
  deleteSubject: (projectId: string, subjectId: string) => void;

  // 연관어 관리
  addRelation: (projectId: string, subjectId: string) => void;
  updateRelation: (projectId: string, subjectId: string, relationId: string, updates: Partial<Relation>) => void;
  deleteRelation: (projectId: string, subjectId: string, relationId: string) => void;

  // 표현 관리 (주제어 직속)
  addSubjectAnalysis: (projectId: string, subjectId: string) => void;
  updateSubjectAnalysis: (projectId: string, subjectId: string, analysisId: string, updates: Partial<AnalysisExpression>) => void;
  deleteSubjectAnalysis: (projectId: string, subjectId: string, analysisId: string) => void;

  // 표현 관리 (연관어 하위)
  addRelationAnalysis: (projectId: string, subjectId: string, relationId: string) => void;
  updateRelationAnalysis: (projectId: string, subjectId: string, relationId: string, analysisId: string, updates: Partial<AnalysisExpression>) => void;
  deleteRelationAnalysis: (projectId: string, subjectId: string, relationId: string, analysisId: string) => void;

  // 키워드 관리
  addKeyword: (projectId: string, subjectId: string, relationId?: string) => void;
  updateKeyword: (projectId: string, subjectId: string, keywordId: string, updates: Partial<Keyword>, relationId?: string) => void;
  deleteKeyword: (projectId: string, subjectId: string, keywordId: string, relationId?: string) => void;

  // 로그 관리
  addLog: (log: Omit<AnalysisLog, 'id'>) => void;
  updateLogProgress: (logId: string, progress: number, status?: AnalysisLog['status']) => void;

  // 선택
  setSelectedProject: (id: string | null) => void;
}

// 샘플 데이터 - 데모용 userId 사용
const DEMO_USER_ID = 'demo_user';
const sampleProjectId1 = `${DEMO_USER_ID}_1733054400000_abc123`; // 2025-12-01 기준
const sampleProjectId2 = `${DEMO_USER_ID}_1733832000000_def456`; // 2025-12-10 기준
const sampleProjectId3 = `${DEMO_USER_ID}_1733400000000_ghi789`; // 2025-12-05 기준

const sampleProjects: AnalysisProject[] = [
  {
    id: sampleProjectId1,
    name: '맥주 브랜드 분석',
    status: 'available',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-15T14:30:00Z',
    data: [{ domain: 'blog', type: 'text' }],
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    autoUpdate: false,
    subjects: [
      {
        id: 'subject-1',
        group_name: '국내 맥주',
        keywords: [
          { id: 'kw-1', name: 'OB맥주', query: 'OB&&(맥주||캔||비어||beer)', info: '' },
          { id: 'kw-2', name: '기네스', query: '기네스&&(맥주||캔||비어||beer)', info: '' },
        ],
        filter_guide: '{@current}를 먹거나 마신다고 언급되었는지 여부',
        relations: [
          {
            id: 'rel-1',
            group_name: '기분/상황',
            edge_name: '먹을 때의 기분/상황',
            keywords: [
              { id: 'rkw-1', name: '기분 전환이 필요할 때', query: '', info: '' },
              { id: 'rkw-2', name: '우울할 때', query: '', info: '' },
            ],
            relation_guide: '{@subject}를 마실 때, {@current} 상황에 해당하는지 여부',
            analyses: [
              {
                id: 'ana-1',
                group_name: '맛 표현',
                edge_name: '먹을 때의 맛 표현',
                text_type: 'narrative',
                pool_size: 0,
                analysis_methods: ['positive', 'negative', 'comprehensive'],
                analysis_guide: '{@relation} 상황에서 {@subject}를 마실 때의 맛 표현을 추출합니다.',
              },
            ],
          },
        ],
        analyses: [],
      },
    ],
  },
  {
    id: sampleProjectId2,
    name: '소주 브랜드 트렌드',
    status: 'unavailable',
    createdAt: '2025-12-10T09:00:00Z',
    updatedAt: '2025-12-10T09:00:00Z',
    data: [],
    start_date: '',
    end_date: '',
    autoUpdate: false,
    subjects: [],
  },
  {
    id: sampleProjectId3,
    name: '스킨케어 제품 분석',
    status: 'analyzing',
    createdAt: '2025-12-05T11:00:00Z',
    updatedAt: '2025-12-20T16:00:00Z',
    data: [{ domain: 'instagram', type: 'text' }, { domain: 'instagram', type: 'image' }],
    start_date: '2025-12-01',
    end_date: '2025-12-31',
    autoUpdate: true,
    subjects: [
      {
        id: 'subject-3',
        group_name: '스킨케어',
        keywords: [{ id: 'kw-5', name: '스킨케어', query: '스킨케어||피부관리', info: '' }],
        filter_guide: '스킨케어 제품 사용 경험 언급 여부',
        relations: [],
        analyses: [],
      },
    ],
  },
];

const sampleLogs: AnalysisLog[] = [
  {
    id: 'log-1',
    projectId: sampleProjectId3,
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
    projectId: sampleProjectId3,
    period: '25.12.16~25.12.20',
    domain: '인스타그램',
    analysisType: '텍스트',
    progress: 65,
    status: 'analyzing',
    requestedAt: '2025-12-20T14:00:00Z',
    completedAt: null,
  },
];

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      projects: sampleProjects,
      logs: sampleLogs,
      selectedProjectId: null,

  createProject: (name: string) => {
    const now = new Date().toISOString();
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'anonymous';

    // 프로젝트 ID는 userId + 생성시각 기반 (이름 변경 시에도 ID 유지)
    // UUID 대신 간단한 형식 사용
    const id = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newProject: AnalysisProject = {
      id,
      name,
      status: 'unavailable',
      createdAt: now,
      updatedAt: now,
      data: [],
      start_date: '',
      end_date: '',
      autoUpdate: false,
      subjects: [],
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
    return id;
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      logs: state.logs.filter((l) => l.projectId !== id),
    }));
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  setProjectStatus: (id, status) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  startAnalysis: (id, data, startDate, endDate, autoUpdate) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'analyzing' as AnalysisStatus,
              data,
              start_date: startDate,
              end_date: endDate,
              autoUpdate,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));

    // 로그 추가
    const project = get().getProject(id);
    if (project) {
      data.forEach((d) => {
        get().addLog({
          projectId: id,
          period: `${startDate}~${endDate}`,
          domain: d.domain === 'blog' ? '블로그' : d.domain === 'instagram' ? '인스타그램' : '뉴스',
          analysisType: d.type === 'text' ? '텍스트' : '이미지',
          progress: 0,
          status: 'analyzing',
          requestedAt: new Date().toISOString(),
          completedAt: null,
        });
      });
    }
  },

  stopAnalysis: (id) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: 'available' as AnalysisStatus, updatedAt: new Date().toISOString() } : p
      ),
      logs: state.logs.map((l) =>
        l.projectId === id && l.status === 'analyzing' ? { ...l, status: 'failed' as const } : l
      ),
    }));
  },

  addSubject: (projectId) => {
    const newSubject: Subject = {
      id: uuidv4(),
      group_name: '',
      keywords: [],
      filter_guide: '',
      relations: [],
      analyses: [],
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, subjects: [...p.subjects, newSubject], updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  },

  updateSubject: (projectId, subjectId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) => (s.id === subjectId ? { ...s, ...updates } : s)),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  deleteSubject: (projectId, subjectId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.filter((s) => s.id !== subjectId),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  addRelation: (projectId, subjectId) => {
    const newRelation: Relation = {
      id: uuidv4(),
      group_name: '',
      edge_name: '',
      keywords: [],
      relation_guide: '',
      analyses: [],
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId ? { ...s, relations: [...s.relations, newRelation] } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  updateRelation: (projectId, subjectId, relationId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      relations: s.relations.map((r) => (r.id === relationId ? { ...r, ...updates } : r)),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  deleteRelation: (projectId, subjectId, relationId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId ? { ...s, relations: s.relations.filter((r) => r.id !== relationId) } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  addSubjectAnalysis: (projectId, subjectId) => {
    const newAnalysis: AnalysisExpression = {
      id: uuidv4(),
      group_name: '',
      edge_name: '',
      text_type: 'narrative',
      pool_size: 0,
      analysis_methods: ['positive', 'negative', 'comprehensive'],
      analysis_guide: '',
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId ? { ...s, analyses: [...s.analyses, newAnalysis] } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  updateSubjectAnalysis: (projectId, subjectId, analysisId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      analyses: s.analyses.map((a) => (a.id === analysisId ? { ...a, ...updates } : a)),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  deleteSubjectAnalysis: (projectId, subjectId, analysisId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId ? { ...s, analyses: s.analyses.filter((a) => a.id !== analysisId) } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  addRelationAnalysis: (projectId, subjectId, relationId) => {
    const newAnalysis: AnalysisExpression = {
      id: uuidv4(),
      group_name: '',
      edge_name: '',
      text_type: 'narrative',
      pool_size: 0,
      analysis_methods: ['positive', 'negative', 'comprehensive'],
      analysis_guide: '',
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      relations: s.relations.map((r) =>
                        r.id === relationId ? { ...r, analyses: [...r.analyses, newAnalysis] } : r
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  updateRelationAnalysis: (projectId, subjectId, relationId, analysisId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      relations: s.relations.map((r) =>
                        r.id === relationId
                          ? {
                              ...r,
                              analyses: r.analyses.map((a) => (a.id === analysisId ? { ...a, ...updates } : a)),
                            }
                          : r
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  deleteRelationAnalysis: (projectId, subjectId, relationId, analysisId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      relations: s.relations.map((r) =>
                        r.id === relationId ? { ...r, analyses: r.analyses.filter((a) => a.id !== analysisId) } : r
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  addKeyword: (projectId, subjectId, relationId) => {
    const newKeyword: Keyword = {
      id: uuidv4(),
      name: '',
      query: '',
      info: '',
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? relationId
                    ? {
                        ...s,
                        relations: s.relations.map((r) =>
                          r.id === relationId ? { ...r, keywords: [...r.keywords, newKeyword] } : r
                        ),
                      }
                    : { ...s, keywords: [...s.keywords, newKeyword] }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  updateKeyword: (projectId, subjectId, keywordId, updates, relationId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? relationId
                    ? {
                        ...s,
                        relations: s.relations.map((r) =>
                          r.id === relationId
                            ? { ...r, keywords: r.keywords.map((k) => (k.id === keywordId ? { ...k, ...updates } : k)) }
                            : r
                        ),
                      }
                    : { ...s, keywords: s.keywords.map((k) => (k.id === keywordId ? { ...k, ...updates } : k)) }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  deleteKeyword: (projectId, subjectId, keywordId, relationId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              subjects: p.subjects.map((s) =>
                s.id === subjectId
                  ? relationId
                    ? {
                        ...s,
                        relations: s.relations.map((r) =>
                          r.id === relationId ? { ...r, keywords: r.keywords.filter((k) => k.id !== keywordId) } : r
                        ),
                      }
                    : { ...s, keywords: s.keywords.filter((k) => k.id !== keywordId) }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },

  addLog: (log) => {
    set((state) => ({
      logs: [...state.logs, { ...log, id: uuidv4() }],
    }));
  },

  updateLogProgress: (logId, progress, status) => {
    set((state) => ({
      logs: state.logs.map((l) =>
        l.id === logId
          ? {
              ...l,
              progress,
              status: status || l.status,
              completedAt: status === 'completed' ? new Date().toISOString() : l.completedAt,
            }
          : l
      ),
    }));
  },

  setSelectedProject: (id) => {
    set({ selectedProjectId: id });
  },
    }),
    {
      name: 'profilenet-analysis-store',
    }
  )
);
