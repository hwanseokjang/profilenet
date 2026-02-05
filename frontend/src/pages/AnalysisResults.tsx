import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack as BackIcon, Search as SearchIcon } from '@mui/icons-material';
import NetworkGraph from '../components/NetworkGraph/NetworkGraph';
import SubjectNodePanel from '../components/NodePanels/SubjectNodePanel';
import RelationNodePanel from '../components/NodePanels/RelationNodePanel';
import ExpressionNodePanel from '../components/NodePanels/ExpressionNodePanel';
import { getAnalysisResultsApi, getNodeDetailApi } from '../services/api';
import type {
  AnalysisResultsData,
  NodeType,
  SubjectNodeDetail,
  RelationNodeDetail,
  ExpressionNodeDetail,
} from '../types/results';

export default function AnalysisResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultsData, setResultsData] = useState<AnalysisResultsData | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [textQuery, setTextQuery] = useState<string>('');

  // 선택된 노드 상태
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);
  const [nodeDetailLoading, setNodeDetailLoading] = useState(false);
  const [nodeDetail, setNodeDetail] = useState<
    SubjectNodeDetail | RelationNodeDetail | ExpressionNodeDetail | null
  >(null);

  // 전역 주제어 키워드 필터 (모든 노드에 적용)
  const [selectedSubjectKeywords, setSelectedSubjectKeywords] = useState<string[]>([]);
  // 임시 주제어 키워드 선택 (반영 전)
  const [tempSelectedSubjectKeywords, setTempSelectedSubjectKeywords] = useState<string[]>([]);

  // 결과 데이터 로드
  useEffect(() => {
    const fetchResults = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        console.log('=== AnalysisResults: Fetching data for project:', id);
        const response = await getAnalysisResultsApi({ projectId: id });
        console.log('=== AnalysisResults: API Response:', response);

        if (response.success && response.data) {
          console.log('=== AnalysisResults: Data loaded successfully:', response.data);
          console.log('=== NetworkGraph data:', response.data.networkGraph);
          setResultsData(response.data);
          // 첫 번째 기간을 기본 선택
          if (response.data.availablePeriods.length > 0) {
            setStartDate(response.data.availablePeriods[0].startDate);
            setEndDate(response.data.availablePeriods[0].endDate);
          }
        } else {
          console.error('=== AnalysisResults: API returned error:', response.message);
          setError(response.message || '결과를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('=== AnalysisResults: Exception occurred:', err);
        setError('결과를 불러오는 중 오류가 발생했습니다.');
        console.error('Failed to fetch results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  // 노드 클릭 핸들러
  const handleNodeClick = async (nodeId: string, nodeType: string) => {
    if (!resultsData || !startDate || !endDate) return;

    setSelectedNodeId(nodeId);
    setSelectedNodeType(nodeType as NodeType);
    setNodeDetailLoading(true);
    setNodeDetail(null);

    try {
      const response = await getNodeDetailApi({
        projectId: resultsData.projectId,
        nodeId,
        period: {
          startDate,
          endDate,
        },
      });

      if (response.success) {
        setNodeDetail(response.data);

        // 주제어 노드 선택 시: 전역 주제어 필터가 비어있으면 모든 키워드로 초기화
        if (nodeType === 'subject' && selectedSubjectKeywords.length === 0) {
          const subjectDetail = response.data as SubjectNodeDetail;
          const allKeywords = subjectDetail.keywords.map((k) => k.id);
          setSelectedSubjectKeywords(allKeywords);
          setTempSelectedSubjectKeywords(allKeywords);
        } else if (nodeType === 'subject') {
          // 이미 전역 필터가 설정되어 있으면 임시 선택을 전역 필터로 동기화
          setTempSelectedSubjectKeywords(selectedSubjectKeywords);
        }
      }
    } catch (err) {
      console.error('Failed to fetch node detail:', err);
    } finally {
      setNodeDetailLoading(false);
    }
  };

  // 주제어 키워드 선택 토글 핸들러 (임시 선택)
  const handleSubjectKeywordToggle = (keywordId: string) => {
    setTempSelectedSubjectKeywords((prev) =>
      prev.includes(keywordId) ? prev.filter((id) => id !== keywordId) : [...prev, keywordId]
    );
  };

  // 주제어 키워드 선택 반영 (전역 적용)
  const handleApplySubjectKeywords = () => {
    setSelectedSubjectKeywords(tempSelectedSubjectKeywords);
  };

  // 기간 적용 핸들러
  const handleApplyPeriod = () => {
    // 기간 변경 시 선택된 노드 및 범위 지정 초기화
    setSelectedNodeId(null);
    setSelectedNodeType(null);
    setNodeDetail(null);
    setSelectedSubjectKeywords([]);
    setTempSelectedSubjectKeywords([]);
  };

  // 텍스트 쿼리 전송 핸들러
  const handleTextQuery = () => {
    console.log('Text query:', textQuery);
    // TODO: Implement LLM query to Cypher conversion
    alert('텍스트 쿼리 기능은 준비 중입니다.\n쿼리: ' + textQuery);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <CircularProgress sx={{ color: '#14b8a6' }} />
      </Box>
    );
  }

  if (error || !resultsData) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: '#ef4444',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          오류 발생
        </Typography>
        <Typography variant="body2">{error || '결과 데이터를 찾을 수 없습니다.'}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/monitoring')} sx={{ color: '#9ca3af' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ color: '#f9fafb', fontWeight: 700 }}>
          {resultsData.projectName} - 분석 결과
        </Typography>
      </Box>

      {/* 기간 선택 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="시작일"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            bgcolor: '#1f2937',
            '& .MuiInputLabel-root': { color: '#9ca3af' },
            '& .MuiInputBase-input': { color: '#f9fafb' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#374151' },
              '&:hover fieldset': { borderColor: '#14b8a6' },
            },
          }}
        />
        <Typography sx={{ color: '#9ca3af' }}>~</Typography>
        <TextField
          label="종료일"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            bgcolor: '#1f2937',
            '& .MuiInputLabel-root': { color: '#9ca3af' },
            '& .MuiInputBase-input': { color: '#f9fafb' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#374151' },
              '&:hover fieldset': { borderColor: '#14b8a6' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleApplyPeriod}
          sx={{
            bgcolor: '#14b8a6',
            '&:hover': { bgcolor: '#0d9488' },
          }}
        >
          적용
        </Button>
        <Typography variant="body2" sx={{ color: '#6b7280', ml: 2 }}>
          가능한 기간: {resultsData.availablePeriods.map((p) => p.label).join(', ')}
        </Typography>
      </Box>

      {/* 네트워크 그래프 및 범위 지정 패널 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
          분석 구조
        </Typography>
        <Grid container spacing={3}>
          {/* 좌측: 네트워크 그래프 */}
          <Grid size={{ xs: 12, md: selectedNodeId && selectedNodeType === 'subject' ? 9 : 12 }}>
            <NetworkGraph data={resultsData.networkGraph} onNodeClick={handleNodeClick} />
          </Grid>

          {/* 우측: 주제어 키워드 선택 패널 (주제어 노드 선택 시만) */}
          {selectedNodeId && selectedNodeType === 'subject' && nodeDetail && (
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: 2,
                  position: 'sticky',
                  top: '20px',
                  maxHeight: 'calc(100vh - 40px)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
                  범위 지정 (전체 노드 적용)
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                  주제어를 선택하면 모든 노드에 필터가 적용됩니다
                </Typography>

                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(nodeDetail as SubjectNodeDetail).keywords.map((keyword) => (
                      <FormControlLabel
                        key={keyword.id}
                        control={
                          <Checkbox
                            checked={tempSelectedSubjectKeywords.includes(keyword.id)}
                            onChange={() => handleSubjectKeywordToggle(keyword.id)}
                            sx={{
                              color: '#14b8a6',
                              '&.Mui-checked': {
                                color: '#14b8a6',
                              },
                            }}
                          />
                        }
                        label={<Typography sx={{ color: '#f9fafb', fontSize: '14px' }}>{keyword.name}</Typography>}
                      />
                    ))}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleApplySubjectKeywords}
                  sx={{
                    bgcolor: '#14b8a6',
                    '&:hover': { bgcolor: '#0d9488' },
                  }}
                >
                  반영
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* 노드 상세 패널 */}
      {selectedNodeId && (
        <Box sx={{ mt: 3 }}>
          {nodeDetailLoading ? (
            <Paper
              sx={{
                p: 4,
                bgcolor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress sx={{ color: '#14b8a6' }} />
            </Paper>
          ) : nodeDetail ? (
            <>
              {selectedNodeType === 'subject' && (
                <SubjectNodePanel data={nodeDetail as SubjectNodeDetail} selectedKeywords={selectedSubjectKeywords} />
              )}
              {selectedNodeType === 'relation' && (
                <RelationNodePanel data={nodeDetail as RelationNodeDetail} selectedKeywords={selectedSubjectKeywords} />
              )}
              {selectedNodeType === 'expression' && (
                <ExpressionNodePanel data={nodeDetail as ExpressionNodeDetail} selectedKeywords={selectedSubjectKeywords} />
              )}
            </>
          ) : null}
        </Box>
      )}

      {/* 노드가 선택되지 않았을 때 안내 메시지 */}
      {!selectedNodeId && (
        <Paper
          sx={{
            p: 6,
            bgcolor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '48px', mb: 2 }}>
            👆
          </Typography>
          <Typography variant="h6" sx={{ color: '#9ca3af', mb: 1 }}>
            노드를 선택해주세요
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            위 그래프에서 노드를 클릭하면 상세 정보를 확인할 수 있습니다.
          </Typography>
        </Paper>
      )}

      {/* 텍스트 쿼리 인터페이스 */}
      <Paper
        sx={{
          p: 3,
          mt: 4,
          bgcolor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, fontWeight: 600 }}>
          텍스트 쿼리 (LLM 기반)
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
          자연어로 질문하면 Cypher 쿼리로 변환하여 분석 결과를 제공합니다.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="예: 카스와 OB맥주 중 어떤 것이 더 긍정적인 반응을 받았나요?"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTextQuery();
              }
            }}
            sx={{
              bgcolor: '#374151',
              '& .MuiInputBase-input': {
                color: '#f9fafb',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#4b5563' },
                '&:hover fieldset': { borderColor: '#14b8a6' },
                '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleTextQuery}
            sx={{
              bgcolor: '#14b8a6',
              minWidth: '120px',
              '&:hover': { bgcolor: '#0d9488' },
            }}
          >
            질의
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
