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
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SubjectNodeDetail } from '../../types/results';

interface SubjectNodePanelProps {
  data: SubjectNodeDetail;
  selectedKeywords?: string[];
}

export default function SubjectNodePanel({ data, selectedKeywords }: SubjectNodePanelProps) {
  // 전역 필터로 키워드 목록 필터링
  const filteredKeywords =
    selectedKeywords && selectedKeywords.length > 0
      ? data.keywords.filter((k) => selectedKeywords.includes(k.id))
      : data.keywords;

  // 선택된 행 (차트/문서 필터링용) - 기본값: 필터링된 모든 키워드
  const [selectedRows, setSelectedRows] = useState<string[]>(filteredKeywords.map((k) => k.id));

  // 전역 필터(selectedKeywords)가 변경되면 selectedRows 재설정
  useEffect(() => {
    const newFilteredKeywords =
      selectedKeywords && selectedKeywords.length > 0
        ? data.keywords.filter((k) => selectedKeywords.includes(k.id))
        : data.keywords;
    setSelectedRows(newFilteredKeywords.map((k) => k.id));
  }, [selectedKeywords, data.keywords]);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10;

  // 선택된 날짜 (일자별 문서 필터링용)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 테이블 행 클릭 - 토글 방식 (2번 클릭하면 해제)
  const handleRowClick = (keywordId: string) => {
    setSelectedRows((prev) =>
      prev.includes(keywordId) ? prev.filter((id) => id !== keywordId) : [...prev, keywordId]
    );
    setCurrentPage(1); // 페이지 초기화
  };

  // 날짜 칩 클릭 핸들러
  const handleDateClick = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
    setCurrentPage(1);
  };

  // 테이블 데이터: 전역 필터로 필터링
  const filteredKeywordIds = filteredKeywords.map((k) => k.id);
  const filteredBuzzData = data.buzzData.filter((item) => filteredKeywordIds.includes(item.keywordId));

  // 차트/문서 필터링용 데이터 - selectedRows 사용
  const selectedKeywordNames = data.keywords
    .filter((k) => selectedRows.includes(k.id))
    .map((k) => k.name);

  // 키워드 필터링
  let filteredDocuments =
    selectedRows.length > 0
      ? data.documents.filter((doc) => doc.keywords.some((kw) => selectedKeywordNames.includes(kw)))
      : data.documents;

  // 날짜 필터링
  if (selectedDate) {
    filteredDocuments = filteredDocuments.filter((doc) => {
      const docDate = new Date(doc.publishedAt).toISOString().split('T')[0];
      return docDate === selectedDate;
    });
  }

  // 추이 차트 데이터 (선택된 행의 키워드들)
  const chartData = data.trendData.map((trend) => {
    const dataPoint: any = { date: trend.date };
    selectedRows.forEach((keywordId) => {
      const keyword = data.keywords.find((k) => k.id === keywordId);
      if (keyword) {
        dataPoint[keyword.name] = trend[keywordId] || 0;
      }
    });
    return dataPoint;
  });

  // 색상 팔레트
  const colors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'];

  // 페이지네이션
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontWeight: 600 }}>
        {data.groupName} - 상세 정보
      </Typography>

      {/* 버즈량 테이블 - 행 클릭으로 선택 */}
      <Paper sx={{ mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2, maxWidth: '600px' }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
          키워드별 버즈량 (행을 클릭하여 선택)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  키워드
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }} align="right">
                  버즈량
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }} align="right">
                  비율
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBuzzData.map((item) => (
                <TableRow
                  key={item.keywordId}
                  onClick={() => handleRowClick(item.keywordId)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedRows.includes(item.keywordId) ? 'rgba(20, 184, 166, 0.2)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(55, 65, 81, 0.5)',
                    },
                  }}
                >
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }}>
                    {item.keywordName}
                  </TableCell>
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                    {item.buzzCount.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                    {item.percentage.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 일자별 추이 차트 - 선택된 키워드들 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
          일자별 추이 ({selectedKeywordNames.length > 0 ? selectedKeywordNames.join(', ') : '키워드를 선택하세요'})
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Legend wrapperStyle={{ color: '#f9fafb' }} />
            {selectedRows.map((keywordId, index) => {
              const keyword = data.keywords.find((k) => k.id === keywordId);
              if (!keyword) return null;
              return (
                <Line
                  key={keywordId}
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

        {/* 날짜 선택 칩들 */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', mr: 1, alignSelf: 'center' }}>
            날짜 선택:
          </Typography>
          {data.trendData.map((trend) => (
            <Chip
              key={trend.date}
              label={new Date(trend.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              onClick={() => handleDateClick(trend.date)}
              sx={{
                bgcolor: selectedDate === trend.date ? '#14b8a6' : '#374151',
                color: selectedDate === trend.date ? 'white' : '#9ca3af',
                fontSize: '11px',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: selectedDate === trend.date ? '#0d9488' : '#4b5563',
                },
              }}
            />
          ))}
          {selectedDate && (
            <Chip
              label="전체"
              onClick={() => setSelectedDate(null)}
              sx={{
                bgcolor: '#8b5cf6',
                color: 'white',
                fontSize: '11px',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#7c3aed',
                },
              }}
            />
          )}
        </Box>
      </Paper>

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
                  sx={{ color: '#14b8a6', mt: 1, display: 'block', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
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
