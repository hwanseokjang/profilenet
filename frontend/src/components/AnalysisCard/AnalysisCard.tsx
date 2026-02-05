import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { AnalysisProject, DataDomain } from '../../types/analysis';
import { statusColors, statusLabels } from '../../types/analysis';
import { useAnalysisStore } from '../../store/analysisStore';
import {
  startAnalysisApi,
  convertProjectToApiRequest,
  stopAnalysisApi,
  getResultsApi,
} from '../../services/api';

interface AnalysisCardProps {
  project: AnalysisProject;
}

export default function AnalysisCard({ project }: AnalysisCardProps) {
  const navigate = useNavigate();
  const { deleteProject, startAnalysis, stopAnalysis } = useAnalysisStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [stopping, setStopping] = useState(false);

  // 분석 시작 폼 상태 - 도메인별 타입 선택
  const [analysisForm, setAnalysisForm] = useState({
    domains: {
      blog: { text: false, image: false },
      instagram: { text: false, image: false },
      news: { text: false, image: false },
    },
    startDate: '',
    endDate: '',
    autoUpdate: false,
  });

  const handleDomainChange = (domain: 'blog' | 'instagram' | 'news', type: 'text' | 'image', checked: boolean) => {
    setAnalysisForm(prev => ({
      ...prev,
      domains: {
        ...prev.domains,
        [domain]: {
          ...prev.domains[domain],
          [type]: checked,
        },
      },
    }));
  };

  const handleDelete = () => {
    console.log('Deleting project:', project.id);
    deleteProject(project.id);
    setDeleteDialogOpen(false);
  };

  const handleStopAnalysis = async () => {
    setStopping(true);
    try {
      const response = await stopAnalysisApi({ id: project.id });
      console.log('=== Stop Analysis Response ===');
      console.log(JSON.stringify(response, null, 2));

      if (response.success) {
        stopAnalysis(project.id);
        alert('\uBD84\uC11D\uC774 \uC911\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.');
      } else {
        alert('\uBD84\uC11D \uC911\uC9C0 \uC2E4\uD328: ' + response.message);
      }
    } catch (error) {
      console.error('Stop Analysis Error:', error);
      alert('API \uD638\uCD9C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.');
    } finally {
      setStopping(false);
    }
  };

  const handleViewResults = async () => {
    try {
      const response = await getResultsApi({ id: project.id });
      console.log('=== Get Results Response ===');
      console.log(JSON.stringify(response, null, 2));

      if (response.success && response.results_url) {
        navigate(response.results_url);
      } else {
        alert(response.message || '\uACB0\uACFC\uB97C \uC870\uD68C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.');
      }
    } catch (error) {
      console.error('Get Results Error:', error);
      alert('API \uD638\uCD9C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.');
    }
  };

  const handleStartAnalysis = async () => {
    const data: DataDomain[] = [];
    const { domains } = analysisForm;

    if (domains.blog.text) data.push({ domain: 'blog', type: 'text' });
    if (domains.blog.image) data.push({ domain: 'blog', type: 'image' });
    if (domains.instagram.text) data.push({ domain: 'instagram', type: 'text' });
    if (domains.instagram.image) data.push({ domain: 'instagram', type: 'image' });
    if (domains.news.text) data.push({ domain: 'news', type: 'text' });
    if (domains.news.image) data.push({ domain: 'news', type: 'image' });

    if (data.length === 0) {
      alert('최소 하나의 데이터 소스를 선택해주세요.');
      return;
    }
    if (!analysisForm.startDate || !analysisForm.endDate) {
      alert('분석 기간을 설정해주세요.');
      return;
    }

    // API 요청 데이터 생성
    const updatedProject: AnalysisProject = {
      ...project,
      data,
      start_date: analysisForm.startDate,
      end_date: analysisForm.endDate,
    };

    try {
      // content-based ID로 변환 (비동기)
      const apiRequest = await convertProjectToApiRequest(updatedProject);

      // API 호출
      console.log('=== Analysis API Request ===');
      console.log(JSON.stringify(apiRequest, null, 2));

      const response = await startAnalysisApi(apiRequest);
      console.log('=== Analysis API Response ===');
      console.log(JSON.stringify(response, null, 2));

      if (response.success) {
        // 로컬 상태 업데이트
        startAnalysis(
          project.id,
          data,
          analysisForm.startDate,
          analysisForm.endDate,
          analysisForm.autoUpdate
        );
        setAnalysisDialogOpen(false);
        alert(`분석이 시작되었습니다.\n요청 ID: ${response.request_id}`);
      } else {
        alert(`분석 시작 실패: ${response.message}\n${response.error_details || ''}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('API 호출 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yy.MM.dd HH:mm');
    } catch {
      return dateStr;
    }
  };

  const getDomainLabel = (data: DataDomain[]) => {
    if (data.length === 0) return '-';
    return data.map(d => {
      const domain = d.domain === 'blog' ? '블로그' : d.domain === 'instagram' ? '인스타그램' : '뉴스';
      const type = d.type === 'text' ? 'TEXT' : '이미지';
      return `${domain}(${type})`;
    }).join(', ');
  };

  return (
    <>
      <Card
        sx={{
          bgcolor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: 2,
          '&:hover': {
            borderColor: '#14b8a6',
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#f9fafb', fontWeight: 600 }}>
              {project.name}
            </Typography>
            <Chip
              label={statusLabels[project.status]}
              size="small"
              sx={{
                bgcolor: statusColors[project.status],
                color: 'white',
                fontWeight: 600,
                fontSize: '12px',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                생성일시
              </Typography>
              <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                {formatDate(project.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                수정일시
              </Typography>
              <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                {formatDate(project.updatedAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                데이터 소스
              </Typography>
              <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                {getDomainLabel(project.data)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                분석 기간
              </Typography>
              <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                {project.start_date && project.end_date
                  ? `${project.start_date} ~ ${project.end_date}`
                  : '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                업데이트 모드
              </Typography>
              <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                {project.autoUpdate ? '자동' : '수동'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/edit/${project.id}`)}
              sx={{
                color: '#14b8a6',
                borderColor: '#14b8a6',
                '&:hover': {
                  borderColor: '#0d9488',
                  bgcolor: 'rgba(20, 184, 166, 0.1)',
                },
              }}
            >
              편집하기
            </Button>
            <IconButton
              size="small"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{
                color: '#ef4444',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              {project.status === 'analyzing' ? (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={handleViewResults}
                    sx={{
                      color: '#9ca3af',
                      borderColor: '#374151',
                      '&:hover': {
                        borderColor: '#14b8a6',
                        color: '#14b8a6',
                      },
                    }}
                  >
                    {'\uACB0\uACFC\uD655\uC778'}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<StopIcon />}
                    onClick={handleStopAnalysis}
                    disabled={stopping}
                    sx={{
                      bgcolor: '#ef4444',
                      '&:hover': {
                        bgcolor: '#dc2626',
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#7f1d1d',
                        color: '#9ca3af',
                      },
                    }}
                  >
                    {stopping ? '\uC911\uC9C0 \uC911...' : '\uC911\uC9C0\uD558\uAE30'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayIcon />}
                  onClick={() => setAnalysisDialogOpen(true)}
                  disabled={project.status !== 'available'}
                  sx={{
                    bgcolor: '#0f766e',
                    '&:hover': {
                      bgcolor: '#0d9488',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#374151',
                      color: '#6b7280',
                    },
                  }}
                >
                  {'\uBD84\uC11D\uD558\uAE30'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1f2937',
            color: '#f9fafb',
          },
        }}
      >
        <DialogTitle>프로젝트 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            "{project.name}" 프로젝트를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#9ca3af' }}>
            취소
          </Button>
          <Button onClick={handleDelete} sx={{ color: '#ef4444' }}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 분석 시작 다이얼로그 */}
      <Dialog
        open={analysisDialogOpen}
        onClose={() => setAnalysisDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1f2937',
            color: '#f9fafb',
          },
        }}
      >
        <DialogTitle>분석 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#9ca3af' }}>
              데이터 소스
            </Typography>
            <Table size="small" sx={{ bgcolor: '#111827', borderRadius: 1, mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ border: '1px solid #374151', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>
                    도메인
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #374151', color: '#6b7280', fontWeight: 600, fontSize: '12px', textAlign: 'center' }}>
                    TEXT
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #374151', color: '#6b7280', fontWeight: 600, fontSize: '12px', textAlign: 'center' }}>
                    이미지
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { key: 'blog' as const, label: '블로그' },
                  { key: 'instagram' as const, label: '인스타그램' },
                  { key: 'news' as const, label: '뉴스' },
                ].map((domain) => (
                  <TableRow key={domain.key}>
                    <TableCell sx={{ border: '1px solid #374151', color: '#f9fafb', fontSize: '13px' }}>
                      {domain.label}
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #374151', textAlign: 'center', p: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={analysisForm.domains[domain.key].text}
                        onChange={(e) => handleDomainChange(domain.key, 'text', e.target.checked)}
                        sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#14b8a6' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #374151', textAlign: 'center', p: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={analysisForm.domains[domain.key].image}
                        onChange={(e) => handleDomainChange(domain.key, 'image', e.target.checked)}
                        sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#14b8a6' } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: '#9ca3af' }}>
              분석 기간
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="date"
                value={analysisForm.startDate}
                onChange={(e) => setAnalysisForm({ ...analysisForm, startDate: e.target.value })}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f9fafb',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#14b8a6' },
                  },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                  },
                }}
              />
              <Typography sx={{ color: '#9ca3af' }}>~</Typography>
              <TextField
                type="date"
                value={analysisForm.endDate}
                onChange={(e) => setAnalysisForm({ ...analysisForm, endDate: e.target.value })}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f9fafb',
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#14b8a6' },
                  },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                  },
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={analysisForm.autoUpdate}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, autoUpdate: e.target.checked })}
                  sx={{ color: '#9ca3af', '&.Mui-checked': { color: '#14b8a6' } }}
                />
              }
              label="자동 업데이트 (매일 새벽 2시 전일자 분석)"
              sx={{ mt: 2, color: '#f9fafb' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialogOpen(false)} sx={{ color: '#9ca3af' }}>
            취소
          </Button>
          <Button
            onClick={handleStartAnalysis}
            variant="contained"
            sx={{
              bgcolor: '#0f766e',
              '&:hover': {
                bgcolor: '#0d9488',
              },
            }}
          >
            분석 시작
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
