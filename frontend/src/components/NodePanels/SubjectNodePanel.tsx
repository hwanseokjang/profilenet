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
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SubjectNodeDetail } from '../../types/results';

interface SubjectNodePanelProps {
  data: SubjectNodeDetail;
}

export default function SubjectNodePanel({ data }: SubjectNodePanelProps) {
  const top20Keywords = data.keywords.slice(0, 20);

  const [pendingKwIds, setPendingKwIds] = useState<string[]>(top20Keywords.map((kw) => kw.id));
  const [appliedKwIds, setAppliedKwIds] = useState<string[]>(top20Keywords.map((kw) => kw.id));
  // 차트에 표시할 키워드 (버즈 테이블 행 클릭으로 토글)
  const [chartKwIds, setChartKwIds] = useState<string[]>(top20Keywords.map((kw) => kw.id));

  const [buzzPage, setBuzzPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const buzzPerPage = 20;
  const documentsPerPage = 10;

  const filteredBuzzData = data.buzzData.filter((item) => appliedKwIds.includes(item.keywordId));
  const appliedKwNames = top20Keywords
    .filter((kw) => appliedKwIds.includes(kw.id))
    .map((kw) => kw.name);

  const buzzTotalPages = Math.ceil(filteredBuzzData.length / buzzPerPage);
  const paginatedBuzzData = filteredBuzzData.slice(
    (buzzPage - 1) * buzzPerPage,
    buzzPage * buzzPerPage
  );

  const handleBuzzRowClick = (kwId: string) => {
    setChartKwIds((prev) =>
      prev.includes(kwId) ? prev.filter((id) => id !== kwId) : [...prev, kwId]
    );
  };

  const chartData = data.trendData.map((trend) => {
    const dataPoint: Record<string, number | string> = { date: trend.date };
    chartKwIds.forEach((kwId) => {
      const keyword = data.keywords.find((k) => k.id === kwId);
      if (keyword) dataPoint[keyword.name] = (trend[kwId] as number) || 0;
    });
    return dataPoint;
  });

  const handleChartClick = (chartState: any) => {
    if (!chartState || !chartState.activeLabel) return;
    const date = chartState.activeLabel as string;
    setSelectedDate((prev) => (prev === date ? null : date));
    setCurrentPage(1);
  };

  let filteredDocuments =
    appliedKwNames.length > 0
      ? data.documents.filter((doc) => doc.keywords.some((kw) => appliedKwNames.includes(kw)))
      : data.documents;

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

  const colors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'];

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
        {data.groupName} - 상세 정보
      </Typography>

      {/* 주제어 선택 패널 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1.5, fontWeight: 600 }}>
          주제어 선택{' '}
          <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>
            (상위 {top20Keywords.length}개)
          </Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <Button variant="outlined" size="small" onClick={() => setPendingKwIds(top20Keywords.map((kw) => kw.id))} sx={outlinedBtnStyle}>전체 선택</Button>
          <Button variant="outlined" size="small" onClick={() => setPendingKwIds([])} sx={outlinedBtnStyle}>전체 제거</Button>
        </Box>
        <Box sx={{ mb: 2 }}>
          {top20Keywords.map((kw) => (
            <Box key={kw.id} sx={{ display: 'inline-flex', alignItems: 'center', mr: 1.5, mb: 0.5 }}>
              <Checkbox
                checked={pendingKwIds.includes(kw.id)}
                onChange={() =>
                  setPendingKwIds((prev) =>
                    prev.includes(kw.id) ? prev.filter((i) => i !== kw.id) : [...prev, kw.id]
                  )
                }
                size="small"
                sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' }, p: 0.5 }}
              />
              <Typography variant="body2" sx={{ color: '#f9fafb', fontSize: '13px' }}>{kw.name}</Typography>
            </Box>
          ))}
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => { setAppliedKwIds(pendingKwIds); setChartKwIds(pendingKwIds); setBuzzPage(1); setCurrentPage(1); }}
          sx={{ bgcolor: '#3b82f6', color: 'white', '&:hover': { bgcolor: '#2563eb' } }}
        >
          적용하기
        </Button>
      </Paper>

      {/* 키워드별 버즈량 테이블 */}
      <Paper sx={{ mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2, maxWidth: '600px' }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
          키워드별 버즈량{' '}
          <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>
            ({filteredBuzzData.length}건)
          </Typography>
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>키워드</TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }} align="right">버즈량</TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }} align="right">비율</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBuzzData.length > 0 ? (
                paginatedBuzzData.map((item) => {
                  const isSelected = chartKwIds.includes(item.keywordId);
                  return (
                  <TableRow
                    key={item.keywordId}
                    onClick={() => handleBuzzRowClick(item.keywordId)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                      opacity: isSelected ? 1 : 0.45,
                      '&:hover': { bgcolor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(55, 65, 81, 0.4)', opacity: 1 },
                    }}
                  >
                    <TableCell sx={{ color: '#3b82f6', borderBottom: '1px solid #374151', fontWeight: 500 }}>
                      {item.keywordName}
                    </TableCell>
                    <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                      {item.buzzCount.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                      {item.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} sx={{ color: '#6b7280', textAlign: 'center', py: 4, borderBottom: 'none' }}>
                    선택된 키워드가 없습니다.
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
                '& .Mui-selected': { bgcolor: '#3b82f6 !important', color: 'white' },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* 일자별 추이 차트 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 0.5, fontWeight: 600 }}>
          일자별 추이
        </Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af', mb: 2, display: 'block' }}>
          차트의 날짜를 클릭하면 해당 일자의 원문만 필터링됩니다
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Legend wrapperStyle={{ color: '#f9fafb' }} />
            {selectedDate && (
              <ReferenceLine x={selectedDate} stroke="#14b8a6" strokeWidth={2} strokeDasharray="4 2" />
            )}
            {chartKwIds.map((kwId, index) => {
              const keyword = data.keywords.find((k) => k.id === kwId);
              if (!keyword) return null;
              return (
                <Line
                  key={kwId}
                  type="monotone"
                  dataKey={keyword.name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
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
                '& .Mui-selected': { bgcolor: '#14b8a6 !important', color: 'white' },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
