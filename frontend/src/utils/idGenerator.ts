import type { Keyword, Relation, AnalysisExpression } from '../types/analysis';

/**
 * 문자열을 SHA-256 해시로 변환 (브라우저 crypto API 사용)
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16); // 16자로 축약
}

/**
 * 동기적으로 간단한 해시 생성 (fallback)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Subject ID 생성: 이름 + 키워드(이름+쿼리+설명) + 조건
 */
export async function generateSubjectId(
  groupName: string,
  keywords: Keyword[],
  filterGuide: string
): Promise<string> {
  const keywordsStr = keywords
    .map(kw => `${kw.name}|${kw.query}|${kw.info}`)
    .sort()
    .join('::');

  const content = `subject:${groupName}|${keywordsStr}|${filterGuide}`;

  try {
    return await hashString(content);
  } catch {
    return 'subj_' + simpleHash(content);
  }
}

/**
 * Relation ID 생성: 이름 + 관계명 + 키워드(이름+쿼리+설명) + 조건
 */
export async function generateRelationId(
  groupName: string,
  edgeName: string,
  keywords: Keyword[],
  relationGuide: string
): Promise<string> {
  const keywordsStr = keywords
    .map(kw => `${kw.name}|${kw.query}|${kw.info}`)
    .sort()
    .join('::');

  const content = `relation:${groupName}|${edgeName}|${keywordsStr}|${relationGuide}`;

  try {
    return await hashString(content);
  } catch {
    return 'rel_' + simpleHash(content);
  }
}

/**
 * Analysis Expression ID 생성: 이름 + 타입 + 분석설정 + 조건
 */
export async function generateAnalysisId(
  groupName: string,
  textType: string,
  analysisMethods: string[],
  poolSize: number,
  analysisGuide: string
): Promise<string> {
  const methodsStr = [...analysisMethods].sort().join(',');

  const content = `analysis:${groupName}|${textType}|${methodsStr}|${poolSize}|${analysisGuide}`;

  try {
    return await hashString(content);
  } catch {
    return 'ana_' + simpleHash(content);
  }
}

/**
 * Keyword ID 생성: 이름 + 쿼리 + 설명 기반
 */
export async function generateKeywordId(
  name: string,
  query: string,
  info: string
): Promise<string> {
  const content = `keyword:${name}|${query}|${info}`;

  try {
    return await hashString(content);
  } catch {
    return 'kw_' + simpleHash(content);
  }
}

/**
 * 프로젝트 ID 생성: userId + 생성시각 기반
 * (프로젝트 이름 변경 시에도 ID는 유지됨)
 */
export async function generateProjectId(
  userId: string,
  createdAt: string
): Promise<string> {
  const content = `project:${userId}|${createdAt}`;

  try {
    return await hashString(content);
  } catch {
    return 'proj_' + simpleHash(content);
  }
}

/**
 * Subject의 모든 ID 재생성
 */
export async function regenerateSubjectIds(subject: {
  group_name: string;
  keywords: Keyword[];
  filter_guide: string;
  relations: Relation[];
  analyses: AnalysisExpression[];
}) {
  // Subject ID 생성
  const subjectId = await generateSubjectId(
    subject.group_name,
    subject.keywords,
    subject.filter_guide
  );

  // Keyword IDs 생성
  const keywords = await Promise.all(
    subject.keywords.map(async (kw) => ({
      ...kw,
      id: await generateKeywordId(kw.name, kw.query, kw.info),
    }))
  );

  // Relation IDs 생성
  const relations = await Promise.all(
    subject.relations.map(async (rel) => {
      const relationId = await generateRelationId(
        rel.group_name,
        rel.edge_name,
        rel.keywords,
        rel.relation_guide
      );

      const relKeywords = await Promise.all(
        rel.keywords.map(async (kw) => ({
          ...kw,
          id: await generateKeywordId(kw.name, kw.query, kw.info),
        }))
      );

      const analyses = await Promise.all(
        rel.analyses.map(async (ana) => ({
          ...ana,
          id: await generateAnalysisId(
            ana.group_name,
            ana.text_type,
            ana.analysis_methods,
            ana.pool_size,
            ana.analysis_guide
          ),
        }))
      );

      return {
        ...rel,
        id: relationId,
        keywords: relKeywords,
        analyses,
      };
    })
  );

  // Subject의 직접 분석 IDs 생성
  const analyses = await Promise.all(
    subject.analyses.map(async (ana) => ({
      ...ana,
      id: await generateAnalysisId(
        ana.group_name,
        ana.text_type,
        ana.analysis_methods,
        ana.pool_size,
        ana.analysis_guide
      ),
    }))
  );

  return {
    ...subject,
    id: subjectId,
    keywords,
    relations,
    analyses,
  };
}
