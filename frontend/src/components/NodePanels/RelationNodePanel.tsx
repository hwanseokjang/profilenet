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
import type { RelationNodeDetail } from '../../types/results';

interface RelationNodePanelProps {
  data: RelationNodeDetail;
  selectedKeywords?: string[];
}

export default function RelationNodePanel({ data, selectedKeywords }: RelationNodePanelProps) {
  // PAIR ID 형식: "subjectKeywordId_relationKeywordId"
  // selectedKeywords는 주제어 키워드 필터 (전역 범위 지정)
  const [selectedPairs, setSelectedPairs] = useState<string[]>(
    selectedKeywords && selectedKeywords.length > 0
      ? data.buzzData
          .filter((pair) => selectedKeywords.includes(pair.subjectKeywordId))
          .map((pair) => `${pair.subjectKeywordId}_${pair.relationKeywordId}`)
      : data.buzzData.map((pair) => `${pair.subjectKeywordId}_${pair.relationKeywordId}`)
  );

  // 외부 selectedKeywords가 변경되면 selectedPairs 업데이트
  useEffect(() => {
    if (selectedKeywords && selectedKeywords.length > 0) {
      const newPairs = data.buzzData
        .filter((pair) => selectedKeywords.includes(pair.subjectKeywordId))
        .map((pair) => `${pair.subjectKeywordId}_${pair.relationKeywordId}`);
      setSelectedPairs(newPairs);
    } else {
      // 필터가 없으면 모든 PAIR 선택
      setSelectedPairs(data.buzzData.map((pair) => `${pair.subjectKeywordId}_${pair.relationKeywordId}`));
    }
  }, [selectedKeywords, data.buzzData]);

  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10;

  // 선택된 날짜 (일자별 문서 필터링용)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 테이블 행 클릭 - 토글 방식
  const handleRowClick = (pairId: string) => {
    setSelectedPairs((prev) => (prev.includes(pairId) ? prev.filter((id) => id !== pairId) : [...prev, pairId]));
    setCurrentPage(1);
  };

  // 날짜 칩 클릭 핸들러
  const handleDateClick = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
    setCurrentPage(1);
  };

  // 선택된 PAIR에서 키워드 이름 추출
  const selectedKeywordNames = new Set<string>();
  selectedPairs.forEach((pairId) => {
    const pair = data.buzzData.find((p) => `${p.subjectKeywordId}_${p.relationKeywordId}` === pairId);
    if (pair) {
      selectedKeywordNames.add(pair.subjectKeywordName);
      selectedKeywordNames.add(pair.relationKeywordName);
    }
  });

  // 키워드 필터링
  let filteredDocuments =
    selectedPairs.length > 0
      ? data.documents.filter((doc) => doc.keywords.some((kw) => selectedKeywordNames.has(kw)))
      : data.documents;

  // 날짜 필터링
  if (selectedDate) {
    filteredDocuments = filteredDocuments.filter((doc) => {
      const docDate = new Date(doc.publishedAt).toISOString().split('T')[0];
      return docDate === selectedDate;
    });
  }

  // 추이 차트 데이터 (주제어 + 연관어 PAIR)
  const selectedPairLabels = selectedPairs.map((pairId) => {
    const pair = data.buzzData.find((p) => `${p.subjectKeywordId}_${p.relationKeywordId}` === pairId);
    if (pair) {
      return {
        pairId,
        label: `${pair.subjectKeywordName} + ${pair.relationKeywordName}`,
        relationKeywordId: pair.relationKeywordId,
      };
    }
    return null;
  }).filter((item): item is { pairId: string; label: string; relationKeywordId: string } => item !== null);

  const chartData = data.trendData.map((trend) => {
    const dataPoint: any = { date: trend.date };
    selectedPairLabels.forEach((item) => {
      dataPoint[item.label] = trend[item.relationKeywordId] || 0;
    });
    return dataPoint;
  });

  // 색상 팔레트
  const colors = ['#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'];

  // 페이지네이션
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, fontWeight: 600 }}>
        {data.groupName} ({data.edgeName}) - 상세 정보
      </Typography>

      {/* 주제어+연관어 PAIR 버즈량 테이블 */}
      <Paper sx={{ mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', p: 2, fontWeight: 600 }}>
          주제어+연관어 조합별 버즈량
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  주제어
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  연관어
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
              {data.buzzData.map((pair) => {
                const pairId = `${pair.subjectKeywordId}_${pair.relationKeywordId}`;
                const isSelected = selectedPairs.includes(pairId);
                return (
                  <TableRow
                    key={pairId}
                    onClick={() => handleRowClick(pairId)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(55, 65, 81, 0.5)',
                      },
                    }}
                  >
                    <TableCell sx={{ color: '#3b82f6', borderBottom: '1px solid #374151', fontWeight: 500 }}>
                      {pair.subjectKeywordName}
                    </TableCell>
                    <TableCell sx={{ color: '#8b5cf6', borderBottom: '1px solid #374151', fontWeight: 500 }}>
                      {pair.relationKeywordName}
                    </TableCell>
                    <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                      {pair.buzzCount.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }} align="right">
                      {pair.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 일자별 추이 차트 (연관어) */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1f2937', border: '1px solid #374151', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
          일자별 추이 (연관어)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Legend wrapperStyle={{ color: '#f9fafb' }} />
            {selectedPairLabels.map((item, index) => (
              <Line
                key={item.pairId}
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
                <Chip label={doc.domain} size="small" sx={{ bgcolor: '#8b5cf6', color: 'white', fontSize: '11px' }} />
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
                    color: '#8b5cf6',
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
                  bgcolor: '#8b5cf6 !important',
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
