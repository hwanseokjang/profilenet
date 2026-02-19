import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
} from '@mui/material';
import type { ExpressionNodeDetail, SentimentType } from '../../types/results';

interface ExpressionNodePanelProps {
  data: ExpressionNodeDetail;
  selectedKeywords?: string[];
}

export default function ExpressionNodePanel({ data, selectedKeywords }: ExpressionNodePanelProps) {
  const top10SubjectKws = (data.subjectKeywords || []).slice(0, 10);
  const top10RelationKws = (data.relationKeywords || []).slice(0, 10);
  const hasKeywordContext = top10SubjectKws.length > 0 || top10RelationKws.length > 0;

  const [selectedSentiments, setSelectedSentiments] = useState<SentimentType[]>(['긍정', '부정', '중립']);
  const [clusterSentiment, setClusterSentiment] = useState<SentimentType>('종합');
  const [showCluster, setShowCluster] = useState(false);
  const [selectedClusterRows, setSelectedClusterRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const documentsPerPage = 15;

  const [pendingSubjectKwIds, setPendingSubjectKwIds] = useState<string[]>(
    top10SubjectKws.map((kw) => kw.id)
  );
  const [pendingRelationKwIds, setPendingRelationKwIds] = useState<string[]>(
    top10RelationKws.map((kw) => kw.id)
  );
  const [appliedSubjectKwIds, setAppliedSubjectKwIds] = useState<string[]>(
    top10SubjectKws.map((kw) => kw.id)
  );
  const [appliedRelationKwIds, setAppliedRelationKwIds] = useState<string[]>(
    top10RelationKws.map((kw) => kw.id)
  );

  const handleSentimentToggle = (sentiment: SentimentType) => {
    setSelectedSentiments((prev) =>
      prev.includes(sentiment) ? prev.filter((s) => s !== sentiment) : [...prev, sentiment]
    );
  };

  const handleClusterToggle = () => {
    setShowCluster(!showCluster);
    setSelectedClusterRows([]);
    setCurrentPage(1);
  };

  const handleClusterRowClick = (clusterId: string) => {
    setSelectedClusterRows((prev) =>
      prev.includes(clusterId) ? prev.filter((c) => c !== clusterId) : [...prev, clusterId]
    );
    setCurrentPage(1);
  };

  const handleRowClick = (docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId));
  };

  // ─────────────────────────────
  // 표현별 뷰: 문서 필터링
  // ─────────────────────────────
  const expressionDocs = data.documents.filter(
    (doc) => doc.expressions != null && Object.keys(doc.expressions).length > 0
  );

  let filteredExprDocs = expressionDocs;

  if (top10SubjectKws.length > 0 && appliedSubjectKwIds.length > 0) {
    const appliedSubjectNames = top10SubjectKws
      .filter((kw) => appliedSubjectKwIds.includes(kw.id))
      .map((kw) => kw.name);
    filteredExprDocs = filteredExprDocs.filter(
      (doc) => !doc.subjectKeywordName || appliedSubjectNames.includes(doc.subjectKeywordName)
    );
  }

  if (top10RelationKws.length > 0 && appliedRelationKwIds.length > 0) {
    const appliedRelationNames = top10RelationKws
      .filter((kw) => appliedRelationKwIds.includes(kw.id))
      .map((kw) => kw.name);
    filteredExprDocs = filteredExprDocs.filter(
      (doc) => !doc.relationKeywordName || appliedRelationNames.includes(doc.relationKeywordName)
    );
  }

  // 감성 필터: 선택된 감성 중 하나라도 표현이 있는 문서만
  filteredExprDocs = filteredExprDocs.filter(
    (doc) => selectedSentiments.some((s) => !!doc.expressions?.[s])
  );

  if (selectedKeywords && selectedKeywords.length > 0) {
    filteredExprDocs = filteredExprDocs.filter((doc) =>
      doc.keywords.some((kw) => selectedKeywords.includes(kw))
    );
  }

  const sortedExprDocs = [...filteredExprDocs].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const exprTotalPages = Math.ceil(sortedExprDocs.length / documentsPerPage);
  const paginatedExprDocs = sortedExprDocs.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  // ─────────────────────────────
  // 클러스터 뷰: 원문 목록
  // ─────────────────────────────
  let clusterDocuments =
    selectedClusterRows.length > 0
      ? data.documents.filter((doc) =>
          selectedClusterRows.some((clusterId) => {
            const cluster = data.clusterData.find((c) => c.clusterId === clusterId);
            return cluster?.topExpressions.some((expr) => doc.content.includes(expr));
          })
        )
      : data.documents;

  if (selectedKeywords && selectedKeywords.length > 0) {
    clusterDocuments = clusterDocuments.filter((doc) =>
      doc.keywords.some((kw) => selectedKeywords.includes(kw))
    );
  }

  const clusterTotalPages = Math.ceil(clusterDocuments.length / documentsPerPage);
  const paginatedClusterDocs = clusterDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  // ─────────────────────────────
  // 유틸
  // ─────────────────────────────
  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case '긍정': return '#10b981';
      case '부정': return '#ef4444';
      case '중립': return '#6b7280';
      case '종합': return '#14b8a6';
      default: return '#9ca3af';
    }
  };

  const truncateTitle = (title: string, len = 10) =>
    title.length > len ? title.slice(0, len) + '…' : title;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const outlinedBtnStyle = {
    borderColor: '#4b5563',
    color: '#9ca3af',
    fontSize: '11px',
    py: 0.5,
    minWidth: 0,
    '&:hover': { borderColor: '#14b8a6', color: '#14b8a6' },
  };

  const headerCellSx = (color = '#9ca3af') => ({
    bgcolor: '#1f2937',
    color,
    borderBottom: '1px solid #374151',
    fontWeight: 600,
    fontSize: '12px',
    py: 1,
    px: 1.5,
  });

  const bodyCellSx = (color = '#f9fafb') => ({
    color,
    borderBottom: '1px solid #2d3748',
    fontSize: '12px',
    py: 0.75,
    px: 1.5,
  });

  const totalColCount = 2 + (hasKeywordContext ? 2 : 0) + selectedSentiments.length;

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontWeight: 600 }}>
        {data.groupName} - 상세 정보 ({data.textType})
      </Typography>

      {/* 주제어/연관어 선택 패널 */}
      {hasKeywordContext && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
          <Grid container spacing={3}>
            {top10SubjectKws.length > 0 && (
              <Grid size={{ xs: top10RelationKws.length > 0 ? 6 : 12 }}>
                <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1.5, fontWeight: 600 }}>
                  주제어 선택{' '}
                  <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>
                    (상위 {top10SubjectKws.length}개)
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Button variant="outlined" size="small" onClick={() => setPendingSubjectKwIds(top10SubjectKws.map((kw) => kw.id))} sx={outlinedBtnStyle}>전체 선택</Button>
                  <Button variant="outlined" size="small" onClick={() => setPendingSubjectKwIds([])} sx={outlinedBtnStyle}>전체 제거</Button>
                </Box>
                <Box sx={{ mb: 2 }}>
                  {top10SubjectKws.map((kw) => (
                    <Box key={kw.id} sx={{ display: 'inline-flex', alignItems: 'center', mr: 1.5, mb: 0.5 }}>
                      <Checkbox
                        checked={pendingSubjectKwIds.includes(kw.id)}
                        onChange={() => setPendingSubjectKwIds((prev) => prev.includes(kw.id) ? prev.filter((i) => i !== kw.id) : [...prev, kw.id])}
                        size="small"
                        sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' }, p: 0.5 }}
                      />
                      <Typography variant="body2" sx={{ color: '#f9fafb', fontSize: '13px' }}>{kw.name}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button variant="contained" size="small" onClick={() => { setAppliedSubjectKwIds(pendingSubjectKwIds); setCurrentPage(1); }} sx={{ bgcolor: '#3b82f6', color: 'white', '&:hover': { bgcolor: '#2563eb' } }}>적용하기</Button>
              </Grid>
            )}

            {top10RelationKws.length > 0 && (
              <Grid size={{ xs: top10SubjectKws.length > 0 ? 6 : 12 }}>
                <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1.5, fontWeight: 600 }}>
                  연관어 선택{' '}
                  <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>
                    (상위 {top10RelationKws.length}개)
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Button variant="outlined" size="small" onClick={() => setPendingRelationKwIds(top10RelationKws.map((kw) => kw.id))} sx={outlinedBtnStyle}>전체 선택</Button>
                  <Button variant="outlined" size="small" onClick={() => setPendingRelationKwIds([])} sx={outlinedBtnStyle}>전체 제거</Button>
                </Box>
                <Box sx={{ mb: 2 }}>
                  {top10RelationKws.map((kw) => (
                    <Box key={kw.id} sx={{ display: 'inline-flex', alignItems: 'center', mr: 1.5, mb: 0.5 }}>
                      <Checkbox
                        checked={pendingRelationKwIds.includes(kw.id)}
                        onChange={() => setPendingRelationKwIds((prev) => prev.includes(kw.id) ? prev.filter((i) => i !== kw.id) : [...prev, kw.id])}
                        size="small"
                        sx={{ color: '#8b5cf6', '&.Mui-checked': { color: '#8b5cf6' }, p: 0.5 }}
                      />
                      <Typography variant="body2" sx={{ color: '#f9fafb', fontSize: '13px' }}>{kw.name}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button variant="contained" size="small" onClick={() => { setAppliedRelationKwIds(pendingRelationKwIds); setCurrentPage(1); }} sx={{ bgcolor: '#8b5cf6', color: 'white', '&:hover': { bgcolor: '#7c3aed' } }}>적용하기</Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* 감성 타입 선택 & 클러스터 토글 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>감성 타입 선택</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {data.availableSentiments.map((sentiment) => (
                <FormControlLabel
                  key={sentiment}
                  control={
                    <Checkbox
                      checked={selectedSentiments.includes(sentiment)}
                      onChange={() => handleSentimentToggle(sentiment)}
                      sx={{ color: getSentimentColor(sentiment), '&.Mui-checked': { color: getSentimentColor(sentiment) } }}
                    />
                  }
                  label={<Typography sx={{ color: '#f9fafb' }}>{sentiment}</Typography>}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>클러스터링 적용</Typography>
              <Button
                variant={showCluster ? 'contained' : 'outlined'}
                onClick={handleClusterToggle}
                sx={{
                  bgcolor: showCluster ? '#14b8a6' : 'transparent',
                  borderColor: '#14b8a6',
                  color: showCluster ? 'white' : '#14b8a6',
                  '&:hover': { bgcolor: showCluster ? '#0d9488' : 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6' },
                }}
              >
                {showCluster ? '클러스터 뷰' : '표현별 뷰'}
              </Button>
            </Box>

            {showCluster && (
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: '#9ca3af', '&.Mui-focused': { color: '#14b8a6' } }}>감성 타입</InputLabel>
                <Select
                  value={clusterSentiment}
                  onChange={(e) => setClusterSentiment(e.target.value as SentimentType)}
                  label="감성 타입"
                  sx={{
                    color: '#f9fafb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#14b8a6' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14b8a6' },
                    '& .MuiSvgIcon-root': { color: '#9ca3af' },
                  }}
                >
                  {data.availableSentiments.map((sentiment) => (
                    <MenuItem key={sentiment} value={sentiment}>{sentiment}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 표현별 뷰: 문서 1:1 매핑 테이블 */}
      {!showCluster && (
        <Paper sx={{ mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
          <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ color: '#f9fafb', fontWeight: 600 }}>
              표현 목록
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              총 {sortedExprDocs.length}건 · 최신순 · 행 클릭 시 원문 확인
            </Typography>
          </Box>

          <TableContainer sx={{ maxHeight: '600px' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx()}>일자</TableCell>
                  <TableCell sx={headerCellSx()}>원문 제목</TableCell>
                  {hasKeywordContext && (
                    <>
                      <TableCell sx={headerCellSx('#3b82f6')}>주제어</TableCell>
                      <TableCell sx={headerCellSx('#8b5cf6')}>연관어</TableCell>
                    </>
                  )}
                  {selectedSentiments.map((sentiment) => (
                    <TableCell key={sentiment} sx={headerCellSx(getSentimentColor(sentiment))}>
                      {sentiment} 표현
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedExprDocs.length > 0 ? (
                  paginatedExprDocs.map((doc) => (
                    <React.Fragment key={doc.id}>
                      {/* 데이터 행 */}
                      <TableRow
                        onClick={() => handleRowClick(doc.id)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: expandedDocId === doc.id ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                          '&:hover': { bgcolor: 'rgba(55, 65, 81, 0.5)' },
                        }}
                      >
                        <TableCell sx={{ ...bodyCellSx('#9ca3af'), whiteSpace: 'nowrap' }}>
                          {formatDate(doc.publishedAt)}
                        </TableCell>

                        <TableCell sx={bodyCellSx()}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ color: '#e5e7eb', fontSize: '12px' }}>
                              {truncateTitle(doc.title)}
                            </Typography>
                            {doc.url && (
                              <Typography
                                component="a"
                                href={doc.url}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                sx={{ color: '#6b7280', fontSize: '10px', textDecoration: 'none', flexShrink: 0, '&:hover': { color: '#14b8a6' } }}
                              >
                                →
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {hasKeywordContext && (
                          <>
                            <TableCell sx={bodyCellSx('#3b82f6')}>{doc.subjectKeywordName || '-'}</TableCell>
                            <TableCell sx={bodyCellSx('#8b5cf6')}>{doc.relationKeywordName || '-'}</TableCell>
                          </>
                        )}

                        {selectedSentiments.map((sentiment) => {
                          const expr = doc.expressions?.[sentiment];
                          return (
                            <TableCell
                              key={sentiment}
                              sx={{
                                ...bodyCellSx(expr ? getSentimentColor(sentiment) : '#4b5563'),
                                fontWeight: expr ? 600 : 400,
                              }}
                            >
                              {expr || '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      {/* 원문 확장 행 */}
                      <TableRow>
                        <TableCell
                          colSpan={totalColCount}
                          sx={{ py: 0, px: 0, borderBottom: expandedDocId === doc.id ? '1px solid #374151' : 'none' }}
                        >
                          <Collapse in={expandedDocId === doc.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: '#111827', borderLeft: '3px solid #14b8a6' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip label={doc.domain} size="small" sx={{ bgcolor: '#14b8a6', color: 'white', fontSize: '11px' }} />
                                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                  {new Date(doc.publishedAt).toLocaleDateString('ko-KR')}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', ml: 'auto' }}>
                                  ▲ 닫기
                                </Typography>
                              </Box>
                              <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1, fontWeight: 600 }}>
                                {doc.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#d1d5db', lineHeight: 1.7 }}>
                                {doc.content}
                              </Typography>
                              {doc.url && (
                                <Typography
                                  variant="caption"
                                  component="a"
                                  href={doc.url}
                                  target="_blank"
                                  sx={{ color: '#14b8a6', mt: 1, display: 'block', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                >
                                  원문 보기 →
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={totalColCount}
                      sx={{ color: '#6b7280', textAlign: 'center', py: 5, borderBottom: 'none' }}
                    >
                      선택된 조건에 해당하는 표현이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {exprTotalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination
                count={exprTotalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                sx={{
                  '& .MuiPaginationItem-root': { color: '#f9fafb' },
                  '& .Mui-selected': { bgcolor: '#14b8a6 !important', color: 'white' },
                }}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* 클러스터 뷰 */}
      {showCluster && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6 }}>
            <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
                클러스터별 분석{' '}
                <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>(행 클릭으로 선택)</Typography>
              </Typography>
              <TableContainer sx={{ maxHeight: '400px' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCellSx()}>클러스터명</TableCell>
                      <TableCell sx={{ ...headerCellSx(), textAlign: 'right' }}>표현 수</TableCell>
                      <TableCell sx={{ ...headerCellSx(), textAlign: 'right' }}>문서 수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.clusterData.map((cluster) => (
                      <TableRow
                        key={cluster.clusterId}
                        onClick={() => handleClusterRowClick(cluster.clusterId)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: selectedClusterRows.includes(cluster.clusterId) ? 'rgba(20, 184, 166, 0.2)' : 'transparent',
                          '&:hover': { bgcolor: 'rgba(55, 65, 81, 0.5)' },
                        }}
                      >
                        <TableCell sx={bodyCellSx()}>{cluster.clusterName}</TableCell>
                        <TableCell sx={{ ...bodyCellSx(), textAlign: 'right' }}>{cluster.expressionCount.toLocaleString()}</TableCell>
                        <TableCell sx={{ ...bodyCellSx(), textAlign: 'right' }}>{cluster.documentCount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
                클러스터 표현 상세{' '}
                {selectedClusterRows.length > 0
                  ? `(${selectedClusterRows.map((id) => data.clusterData.find((c) => c.clusterId === id)?.clusterName).filter(Boolean).join(', ')})`
                  : '(클러스터를 선택하세요)'}
              </Typography>
              <TableContainer sx={{ maxHeight: '400px' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCellSx()}>순위</TableCell>
                      {selectedSentiments.map((sentiment) => (
                        <TableCell
                          key={sentiment}
                          sx={{
                            ...headerCellSx(getSentimentColor(sentiment)),
                            bgcolor: sentiment === clusterSentiment ? 'rgba(20, 184, 166, 0.2)' : '#1f2937',
                          }}
                        >
                          {sentiment} 표현
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedClusterRows.length > 0 ? (
                      (() => {
                        const clusterExpressions = selectedClusterRows.flatMap((clusterId) => {
                          const cluster = data.clusterData.find((c) => c.clusterId === clusterId);
                          return cluster?.topExpressions || [];
                        });

                        const sortBySentiment = (s: SentimentType) =>
                          clusterExpressions
                            .map((expr) => {
                              const b = data.buzzData.find((bz) => bz.expression === expr);
                              return b ? { expr, value: b[s] } : null;
                            })
                            .filter((x): x is { expr: string; value: number } => x !== null)
                            .sort((a, b) => b.value - a.value)
                            .map((x) => x.expr);

                        const sentimentExprs: Record<SentimentType, string[]> = {
                          긍정: sortBySentiment('긍정'),
                          부정: sortBySentiment('부정'),
                          중립: sortBySentiment('중립'),
                          종합: sortBySentiment('종합'),
                        };

                        const maxRows = Math.max(
                          ...selectedSentiments.map((s) => sentimentExprs[s].length),
                          0
                        );

                        return Array.from({ length: maxRows }).map((_, rowIndex) => (
                          <TableRow key={rowIndex}>
                            <TableCell sx={bodyCellSx('#6b7280')}>{rowIndex + 1}</TableCell>
                            {selectedSentiments.map((sentiment) => {
                              const expression = sentimentExprs[sentiment][rowIndex];
                              return (
                                <TableCell
                                  key={sentiment}
                                  sx={{
                                    ...bodyCellSx(expression ? getSentimentColor(sentiment) : '#4b5563'),
                                    bgcolor: sentiment === clusterSentiment ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                                  }}
                                >
                                  {expression || '-'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ));
                      })()
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={selectedSentiments.length + 1}
                          sx={{ color: '#6b7280', textAlign: 'center', py: 4, borderBottom: 'none' }}
                        >
                          왼쪽에서 클러스터를 선택하세요
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 클러스터 뷰용 원문 목록 */}
      {showCluster && (
        <Paper sx={{ p: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
            원문 ({clusterDocuments.length}건)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedClusterDocs.map((doc) => (
              <Box key={doc.id} sx={{ p: 2, bgcolor: '#374151', borderRadius: 1, border: '1px solid #4b5563' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={doc.domain} size="small" sx={{ bgcolor: '#14b8a6', color: 'white', fontSize: '11px' }} />
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    {new Date(doc.publishedAt).toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1, fontWeight: 600 }}>{doc.title}</Typography>
                <Typography variant="body2" sx={{ color: '#d1d5db', lineHeight: 1.6 }}>{doc.content}</Typography>
                {doc.url && (
                  <Typography
                    variant="caption"
                    component="a"
                    href={doc.url}
                    target="_blank"
                    sx={{ color: '#14b8a6', mt: 1, display: 'block', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    원문 보기 →
                  </Typography>
                )}
              </Box>
            ))}
            {clusterDocuments.length === 0 && (
              <Typography sx={{ color: '#6b7280', textAlign: 'center', py: 4 }}>
                선택된 조건에 해당하는 원문이 없습니다.
              </Typography>
            )}
          </Box>

          {clusterTotalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={clusterTotalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                sx={{
                  '& .MuiPaginationItem-root': { color: '#f9fafb' },
                  '& .Mui-selected': { bgcolor: '#14b8a6 !important', color: 'white' },
                }}
              />
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
