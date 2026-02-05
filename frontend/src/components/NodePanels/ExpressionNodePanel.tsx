import { useState } from 'react';
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
} from '@mui/material';
import type { ExpressionNodeDetail, SentimentType } from '../../types/results';

interface ExpressionNodePanelProps {
  data: ExpressionNodeDetail;
  selectedKeywords?: string[];
}

export default function ExpressionNodePanel({ data, selectedKeywords }: ExpressionNodePanelProps) {
  // 표현별 뷰: 감성 타입 복수 선택 (기본: 종합만 선택)
  const [selectedSentiments, setSelectedSentiments] = useState<SentimentType[]>(['종합']);
  // 클러스터 뷰: 감성 타입 단일 선택 (기본: 종합)
  const [clusterSentiment, setClusterSentiment] = useState<SentimentType>('종합');
  const [showCluster, setShowCluster] = useState(false);
  const [selectedExpressionRows, setSelectedExpressionRows] = useState<string[]>([]);
  const [selectedClusterRows, setSelectedClusterRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10;

  // 감성 타입 토글
  const handleSentimentToggle = (sentiment: SentimentType) => {
    setSelectedSentiments((prev) =>
      prev.includes(sentiment) ? prev.filter((s) => s !== sentiment) : [...prev, sentiment]
    );
  };

  // 클러스터 토글
  const handleClusterToggle = () => {
    setShowCluster(!showCluster);
    setSelectedExpressionRows([]);
    setSelectedClusterRows([]);
    setCurrentPage(1);
  };

  // 표현 행 클릭 - 토글 방식
  const handleExpressionRowClick = (expression: string) => {
    setSelectedExpressionRows((prev) =>
      prev.includes(expression) ? prev.filter((e) => e !== expression) : [...prev, expression]
    );
    setCurrentPage(1);
  };

  // 클러스터 행 클릭 - 토글 방식
  const handleClusterRowClick = (clusterId: string) => {
    setSelectedClusterRows((prev) =>
      prev.includes(clusterId) ? prev.filter((c) => c !== clusterId) : [...prev, clusterId]
    );
    setCurrentPage(1);
  };

  // 필터링된 문서
  let filteredDocuments = showCluster
    ? selectedClusterRows.length > 0
      ? data.documents.filter((doc) => {
          return selectedClusterRows.some((clusterId) => {
            const cluster = data.clusterData.find((c) => c.clusterId === clusterId);
            return cluster?.topExpressions.some((expr) => doc.content.includes(expr));
          });
        })
      : data.documents
    : selectedExpressionRows.length > 0
    ? data.documents.filter((doc) => selectedExpressionRows.some((expr) => doc.content.includes(expr)))
    : data.documents;

  // 전역 주제어 필터 적용
  if (selectedKeywords && selectedKeywords.length > 0) {
    filteredDocuments = filteredDocuments.filter((doc) =>
      doc.keywords.some((kw) => selectedKeywords.includes(kw))
    );
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  // 감성별 색상
  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case '긍정':
        return '#10b981';
      case '부정':
        return '#ef4444';
      case '중립':
        return '#6b7280';
      case '종합':
        return '#14b8a6';
      default:
        return '#9ca3af';
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontWeight: 600 }}>
        {data.groupName} - 상세 정보 ({data.textType})
      </Typography>

      {/* 감성 타입 복수 선택 & 클러스터 토글 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          {/* 감성 타입 복수 선택 */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
              감성 타입 선택
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {data.availableSentiments.map((sentiment) => (
                <FormControlLabel
                  key={sentiment}
                  control={
                    <Checkbox
                      checked={selectedSentiments.includes(sentiment)}
                      onChange={() => handleSentimentToggle(sentiment)}
                      sx={{
                        color: getSentimentColor(sentiment),
                        '&.Mui-checked': {
                          color: getSentimentColor(sentiment),
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: '#f9fafb' }}>{sentiment}</Typography>}
                />
              ))}
            </Box>
          </Box>

          {/* 클러스터 토글 버튼 & 감성 타입 선택 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                클러스터링 적용
              </Typography>
              <Button
                variant={showCluster ? 'contained' : 'outlined'}
                onClick={handleClusterToggle}
                sx={{
                  bgcolor: showCluster ? '#14b8a6' : 'transparent',
                  borderColor: '#14b8a6',
                  color: showCluster ? 'white' : '#14b8a6',
                  '&:hover': {
                    bgcolor: showCluster ? '#0d9488' : 'rgba(20, 184, 166, 0.1)',
                    borderColor: '#14b8a6',
                  },
                }}
              >
                {showCluster ? '클러스터 뷰' : '표현별 뷰'}
              </Button>
            </Box>

            {showCluster && (
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel
                  sx={{
                    color: '#9ca3af',
                    '&.Mui-focused': { color: '#14b8a6' },
                  }}
                >
                  감성 타입
                </InputLabel>
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
                    <MenuItem key={sentiment} value={sentiment}>
                      {sentiment}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 표별 뷰 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 클러스터 뷰가 아닐 때: 감성별 표현 테이블 표시 */}
        {!showCluster && (() => {
          // 각 감성별로 버즈량 상위 표현들 추출
          const getSortedExpressionsBySentiment = (sentiment: SentimentType) => {
            return [...data.buzzData]
              .sort((a, b) => b[sentiment] - a[sentiment])
              .map(item => item.expression);
          };

          const sentimentExpressions: Record<SentimentType, string[]> = {
            긍정: getSortedExpressionsBySentiment('긍정'),
            부정: getSortedExpressionsBySentiment('부정'),
            중립: getSortedExpressionsBySentiment('중립'),
            종합: getSortedExpressionsBySentiment('종합'),
          };

          // 최대 행 수 (가장 긴 리스트 기준)
          const maxRows = Math.max(...selectedSentiments.map(s => sentimentExpressions[s].length));

          return (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
                  감성별 표현 (행 클릭으로 선택)
                </Typography>
                <TableContainer sx={{ maxHeight: '400px' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#1f2937', color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                          순위
                        </TableCell>
                        {selectedSentiments.map((sentiment) => (
                          <TableCell
                            key={sentiment}
                            sx={{ bgcolor: '#1f2937', color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}
                          >
                            {sentiment} 표현
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from({ length: maxRows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell sx={{ color: '#6b7280', borderBottom: '1px solid #374151', fontWeight: 500 }}>
                            {rowIndex + 1}
                          </TableCell>
                          {selectedSentiments.map((sentiment) => {
                            const expression = sentimentExpressions[sentiment][rowIndex];
                            return (
                              <TableCell
                                key={sentiment}
                                onClick={() => expression && handleExpressionRowClick(expression)}
                                sx={{
                                  color: expression ? getSentimentColor(sentiment) : '#4b5563',
                                  borderBottom: '1px solid #374151',
                                  cursor: expression ? 'pointer' : 'default',
                                  bgcolor: expression && selectedExpressionRows.includes(expression)
                                    ? 'rgba(20, 184, 166, 0.1)'
                                    : 'transparent',
                                  '&:hover': expression ? {
                                    bgcolor: 'rgba(55, 65, 81, 0.5)',
                                  } : {},
                                }}
                              >
                                {expression || '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          );
        })()}

        {/* 클러스터 뷰일 때: 왼쪽에 클러스터 테이블, 오른쪽에 표현 디테일 */}
        {showCluster && (
          <>
            {/* 클러스터 테이블 (왼쪽) */}
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
                  클러스터별 분석 (행 클릭으로 선택)
                </Typography>
                <TableContainer sx={{ maxHeight: '400px' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#1f2937', color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                          클러스터명
                        </TableCell>
                        <TableCell
                          sx={{ bgcolor: '#1f2937', color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}
                          align="right"
                        >
                          표현 수
                        </TableCell>
                        <TableCell
                          sx={{ bgcolor: '#1f2937', color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}
                          align="right"
                        >
                          문서 수
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.clusterData.map((cluster) => (
                        <TableRow
                          key={cluster.clusterId}
                          onClick={() => handleClusterRowClick(cluster.clusterId)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: selectedClusterRows.includes(cluster.clusterId)
                              ? 'rgba(20, 184, 166, 0.2)'
                              : 'transparent',
                            '&:hover': {
                              bgcolor: 'rgba(55, 65, 81, 0.5)',
                            },
                          }}
                        >
                          <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151', fontWeight: 500 }}>
                            {cluster.clusterName}
                          </TableCell>
                          <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                            {cluster.expressionCount.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                            {cluster.documentCount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* 표현 디테일 (오른쪽) - 선택된 클러스터의 표현들 표시 */}
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
                  클러스터 표현 상세{' '}
                  {selectedClusterRows.length > 0
                    ? `(${selectedClusterRows
                        .map((id) => data.clusterData.find((c) => c.clusterId === id)?.clusterName)
                        .filter(Boolean)
                        .join(', ')})`
                    : '(클러스터를 선택하세요)'}
                </Typography>
                <TableContainer sx={{ maxHeight: '400px' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#1f2937', color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                          순위
                        </TableCell>
                        {selectedSentiments.map((sentiment) => (
                          <TableCell
                            key={sentiment}
                            sx={{
                              bgcolor: sentiment === clusterSentiment ? 'rgba(20, 184, 166, 0.2)' : '#1f2937',
                              color: '#9ca3af',
                              borderBottom: '1px solid #374151',
                              fontWeight: 600
                            }}
                          >
                            {sentiment} 표현
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClusterRows.length > 0 ? (() => {
                        // 선택된 클러스터들의 표현 수집
                        const clusterExpressions = selectedClusterRows.flatMap((clusterId) => {
                          const cluster = data.clusterData.find((c) => c.clusterId === clusterId);
                          return cluster?.topExpressions || [];
                        });

                        // 각 감성별로 정렬된 표현 리스트
                        const getSortedExpressionsBySentiment = (sentiment: SentimentType) => {
                          return clusterExpressions
                            .map(expr => {
                              const buzzItem = data.buzzData.find(b => b.expression === expr);
                              return buzzItem ? { expr, value: buzzItem[sentiment] } : null;
                            })
                            .filter((item): item is { expr: string; value: number } => item !== null)
                            .sort((a, b) => b.value - a.value)
                            .map(item => item.expr);
                        };

                        const sentimentExpressions: Record<SentimentType, string[]> = {
                          긍정: getSortedExpressionsBySentiment('긍정'),
                          부정: getSortedExpressionsBySentiment('부정'),
                          중립: getSortedExpressionsBySentiment('중립'),
                          종합: getSortedExpressionsBySentiment('종합'),
                        };

                        const maxRows = Math.max(...selectedSentiments.map(s => sentimentExpressions[s].length));

                        return Array.from({ length: maxRows }).map((_, rowIndex) => (
                          <TableRow key={rowIndex}>
                            <TableCell sx={{ color: '#6b7280', borderBottom: '1px solid #374151', fontWeight: 500 }}>
                              {rowIndex + 1}
                            </TableCell>
                            {selectedSentiments.map((sentiment) => {
                              const expression = sentimentExpressions[sentiment][rowIndex];
                              return (
                                <TableCell
                                  key={sentiment}
                                  onClick={() => expression && handleExpressionRowClick(expression)}
                                  sx={{
                                    bgcolor: sentiment === clusterSentiment
                                      ? expression && selectedExpressionRows.includes(expression)
                                        ? 'rgba(20, 184, 166, 0.3)'
                                        : 'rgba(20, 184, 166, 0.15)'
                                      : expression && selectedExpressionRows.includes(expression)
                                      ? 'rgba(20, 184, 166, 0.1)'
                                      : 'transparent',
                                    color: expression ? getSentimentColor(sentiment) : '#4b5563',
                                    borderBottom: '1px solid #374151',
                                    cursor: expression ? 'pointer' : 'default',
                                    '&:hover': expression ? {
                                      bgcolor: 'rgba(55, 65, 81, 0.5)',
                                    } : {},
                                  }}
                                >
                                  {expression || '-'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ));
                      })() : (
                        <TableRow>
                          <TableCell
                            colSpan={selectedSentiments.length + 1}
                            sx={{ color: '#6b7280', textAlign: 'center', py: 4, borderBottom: '1px solid #374151' }}
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
          </>
        )}
      </Grid>

      {/* 원문 목록 */}
      <Paper sx={{ p: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
          원문 ({filteredDocuments.length}건)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paginatedDocuments.map((doc) => (
            <Box
              key={doc.id}
              sx={{
                p: 2,
                bgcolor: '#374151',
                borderRadius: 1,
                border: '1px solid #4b5563',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={doc.domain} size="small" sx={{ bgcolor: '#14b8a6', color: 'white', fontSize: '11px' }} />
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  {new Date(doc.publishedAt).toLocaleDateString('ko-KR')}
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1, fontWeight: 600 }}>
                {doc.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d1d5db', lineHeight: 1.6 }}>
                {doc.content}
              </Typography>
              {doc.url && (
                <Typography
                  variant="caption"
                  component="a"
                  href={doc.url}
                  target="_blank"
                  sx={{
                    color: '#14b8a6',
                    mt: 1,
                    display: 'block',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  원문 보기 →
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#f9fafb',
                },
                '& .Mui-selected': {
                  bgcolor: '#14b8a6 !important',
                  color: 'white',
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
