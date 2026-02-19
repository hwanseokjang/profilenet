import { useState, useEffect } from 'react';
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
  Grid,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { RelationNodeDetail } from '../../types/results';

interface RelationNodePanelProps {
  data: RelationNodeDetail;
  selectedKeywords?: string[];
}

export default function RelationNodePanel({ data, selectedKeywords }: RelationNodePanelProps) {
  const top10SubjectKws = data.subjectKeywords.slice(0, 10);
  const top10RelationKws = data.relationKeywords.slice(0, 10);

  const getInitialSubjectIds = () => {
    if (selectedKeywords && selectedKeywords.length > 0) {
      const filtered = top10SubjectKws.filter((kw) => selectedKeywords.includes(kw.id));
      return filtered.length > 0 ? filtered.map((kw) => kw.id) : top10SubjectKws.map((kw) => kw.id);
    }
    return top10SubjectKws.map((kw) => kw.id);
  };

  const [pendingSubjectKwIds, setPendingSubjectKwIds] = useState<string[]>(getInitialSubjectIds);
  const [pendingRelationKwIds, setPendingRelationKwIds] = useState<string[]>(
    top10RelationKws.map((kw) => kw.id)
  );
  const [appliedSubjectKwIds, setAppliedSubjectKwIds] = useState<string[]>(getInitialSubjectIds);
  const [appliedRelationKwIds, setAppliedRelationKwIds] = useState<string[]>(
    top10RelationKws.map((kw) => kw.id)
  );

  const [buzzPage, setBuzzPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const buzzPerPage = 20;
  const documentsPerPage = 10;

  useEffect(() => {
    const newIds =
      selectedKeywords && selectedKeywords.length > 0
        ? top10SubjectKws.filter((kw) => selectedKeywords.includes(kw.id)).map((kw) => kw.id)
        : top10SubjectKws.map((kw) => kw.id);
    setPendingSubjectKwIds(newIds);
    setAppliedSubjectKwIds(newIds);
  }, [selectedKeywords]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredBuzzData = data.buzzData.filter(
    (pair) =>
      appliedSubjectKwIds.includes(pair.subjectKeywordId) &&
      appliedRelationKwIds.includes(pair.relationKeywordId)
  );

  const getPairKey = (subjectId: string, relationId: string) => `${subjectId}_${relationId}`;

  // 차트에 표시할 페어 (버즈 테이블 행 클릭으로 토글)
  const [chartPairKeys, setChartPairKeys] = useState<string[]>(() =>
    data.buzzData.map((p) => getPairKey(p.subjectKeywordId, p.relationKeywordId))
  );

  const handleBuzzRowClick = (subjectId: string, relationId: string) => {
    const key = getPairKey(subjectId, relationId);
    setChartPairKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 버즈 테이블 페이지네이션
  const buzzTotalPages = Math.ceil(filteredBuzzData.length / buzzPerPage);
  const paginatedBuzzData = filteredBuzzData.slice(
    (buzzPage - 1) * buzzPerPage,
    buzzPage * buzzPerPage
  );

  const allPairLabels = filteredBuzzData.map((pair) => ({
    key: getPairKey(pair.subjectKeywordId, pair.relationKeywordId),
    label: `${pair.subjectKeywordName} + ${pair.relationKeywordName}`,
    relationKeywordId: pair.relationKeywordId,
  }));

  // 차트에는 선택된 페어만 표시
  const chartPairLabels = allPairLabels.filter((p) => chartPairKeys.includes(p.key));

  const chartData = data.trendData.map((trend) => {
    const dataPoint: Record<string, number | string> = { date: trend.date };
    chartPairLabels.forEach((item) => {
      dataPoint[item.label] = (trend[item.relationKeywordId] as number) || 0;
    });
    return dataPoint;
  });

  // 차트 클릭으로 날짜 선택
  const handleChartClick = (chartState: any) => {
    if (!chartState || !chartState.activeLabel) return;
    const date = chartState.activeLabel as string;
    setSelectedDate((prev) => (prev === date ? null : date));
    setCurrentPage(1);
  };

  const selectedKeywordNames = new Set<string>();
  filteredBuzzData.forEach((pair) => {
    selectedKeywordNames.add(pair.subjectKeywordName);
    selectedKeywordNames.add(pair.relationKeywordName);
  });

  let filteredDocuments =
    filteredBuzzData.length > 0
      ? data.documents.filter((doc) => doc.keywords.some((kw) => selectedKeywordNames.has(kw)))
      : [];

  if (selectedDate) {
    filteredDocuments = filteredDocuments.filter((doc) => {
      const docDate = new Date(doc.publishedAt).toISOString().split('T')[0];
      return docDate === selectedDate;
    });
  }

  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  const colors = ['#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'];

  const outlinedBtnStyle = {
    borderColor: '#4b5563',
    color: '#9ca3af',
    fontSize: '11px',
    py: 0.5,
    minWidth: 0,
    '&:hover': { borderColor: '#14b8a6', color: '#14b8a6' },
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontWeight: 600 }}>
        {data.groupName} ({data.edgeName}) - 상세 정보
      </Typography>

      {/* 키워드 선택 패널 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* 주제어 선택 */}
          <Grid size={{ xs: 6 }}>
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
            <Button variant="contained" size="small" onClick={() => {
              const newApplied = pendingSubjectKwIds;
              setAppliedSubjectKwIds(newApplied);
              const newFiltered = data.buzzData.filter((p) => newApplied.includes(p.subjectKeywordId) && appliedRelationKwIds.includes(p.relationKeywordId));
              setChartPairKeys(newFiltered.map((p) => getPairKey(p.subjectKeywordId, p.relationKeywordId)));
              setBuzzPage(1); setCurrentPage(1);
            }} sx={{ bgcolor: '#3b82f6', color: 'white', '&:hover': { bgcolor: '#2563eb' } }}>적용하기</Button>
          </Grid>

          {/* 연관어 선택 */}
          <Grid size={{ xs: 6 }}>
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
            <Button variant="contained" size="small" onClick={() => {
              const newApplied = pendingRelationKwIds;
              setAppliedRelationKwIds(newApplied);
              const newFiltered = data.buzzData.filter((p) => appliedSubjectKwIds.includes(p.subjectKeywordId) && newApplied.includes(p.relationKeywordId));
              setChartPairKeys(newFiltered.map((p) => getPairKey(p.subjectKeywordId, p.relationKeywordId)));
              setBuzzPage(1); setCurrentPage(1);
            }} sx={{ bgcolor: '#8b5cf6', color: 'white', '&:hover': { bgcolor: '#7c3aed' } }}>적용하기</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 주제어+연관어 조합별 버즈량 테이블 */}
      <Paper sx={{ mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
          주제어+연관어 조합별 버즈량{' '}
          <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>
            ({filteredBuzzData.length}건)
          </Typography>
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>주제어</TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>연관어</TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }} align="right">버즈량</TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }} align="right">비율</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBuzzData.length > 0 ? (
                paginatedBuzzData.map((pair) => {
                  const pairKey = getPairKey(pair.subjectKeywordId, pair.relationKeywordId);
                  const isSelected = chartPairKeys.includes(pairKey);
                  return (
                    <TableRow
                      key={pairKey}
                      onClick={() => handleBuzzRowClick(pair.subjectKeywordId, pair.relationKeywordId)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                        opacity: isSelected ? 1 : 0.45,
                        '&:hover': { bgcolor: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(55, 65, 81, 0.4)', opacity: 1 },
                      }}
                    >
                      <TableCell sx={{ color: '#3b82f6', borderBottom: '1px solid #374151', fontWeight: 500 }}>{pair.subjectKeywordName}</TableCell>
                      <TableCell sx={{ color: '#8b5cf6', borderBottom: '1px solid #374151', fontWeight: 500 }}>{pair.relationKeywordName}</TableCell>
                      <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">{pair.buzzCount.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">{pair.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: '#6b7280', textAlign: 'center', py: 4, borderBottom: 'none' }}>
                    선택된 주제어와 연관어의 조합이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {buzzTotalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
            <Pagination
              count={buzzTotalPages}
              page={buzzPage}
              onChange={(_, p) => setBuzzPage(p)}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': { color: '#f9fafb' },
                '& .Mui-selected': { bgcolor: '#8b5cf6 !important', color: 'white' },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* 일자별 추이 차트 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 0.5, fontWeight: 600 }}>
          일자별 추이 (연관어)
        </Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af', mb: 2, display: 'block' }}>
          차트의 날짜를 클릭하면 해당 일자의 원문만 필터링됩니다
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Legend wrapperStyle={{ color: '#f9fafb' }} />
            {selectedDate && (
              <ReferenceLine x={selectedDate} stroke="#14b8a6" strokeWidth={2} strokeDasharray="4 2" />
            )}
            {chartPairLabels.map((item, index) => (
              <Line
                key={item.label}
                type="monotone"
                dataKey={item.label}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {selectedDate && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`선택된 날짜: ${new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`}
              size="small"
              sx={{ bgcolor: '#14b8a6', color: 'white', fontSize: '11px' }}
            />
            <Button
              size="small"
              onClick={() => { setSelectedDate(null); setCurrentPage(1); }}
              sx={{ color: '#9ca3af', fontSize: '11px', minWidth: 0, p: 0.5, '&:hover': { color: '#f9fafb' } }}
            >
              전체 보기
            </Button>
          </Box>
        )}
      </Paper>

      {/* 원문 목록 */}
      <Paper sx={{ p: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
          원문 ({filteredDocuments.length}건)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paginatedDocuments.map((doc) => (
            <Box key={doc.id} sx={{ p: 2, bgcolor: '#374151', borderRadius: 1, border: '1px solid #4b5563' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={doc.domain} size="small" sx={{ bgcolor: '#8b5cf6', color: 'white', fontSize: '11px' }} />
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
                  sx={{ color: '#8b5cf6', mt: 1, display: 'block', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  원문 보기 →
                </Typography>
              )}
            </Box>
          ))}
          {filteredDocuments.length === 0 && (
            <Typography sx={{ color: '#6b7280', textAlign: 'center', py: 4 }}>
              선택된 조건에 해당하는 원문이 없습니다.
            </Typography>
          )}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              sx={{
                '& .MuiPaginationItem-root': { color: '#f9fafb' },
                '& .Mui-selected': { bgcolor: '#8b5cf6 !important', color: 'white' },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
