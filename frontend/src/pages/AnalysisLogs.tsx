import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAnalysisStore } from '../store/analysisStore';
import { useAuthStore } from '../store/authStore';
import { getAnalysisLogsApi, type AnalysisLogItem } from '../services/api';

export default function AnalysisLogs() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject } = useAnalysisStore();
  const { user } = useAuthStore();
  const [projectLogs, setProjectLogs] = useState<AnalysisLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const project = getProject(id || '');

  // 로그 데이터를 API로부터 가져오기
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user || !id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getAnalysisLogsApi({
          userId: user.id,
          projectId: id,
        });

        if (response.success) {
          setProjectLogs(response.logs);
        } else {
          setError(response.message || '로그를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('로그를 불러오는 중 오류가 발생했습니다.');
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'yy.MM.dd (HH:mm)');
    } catch {
      return dateStr;
    }
  };

  const getStatusChip = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return <Chip label="완료" size="small" sx={{ bgcolor: '#22c55e', color: 'white', fontSize: '12px' }} />;
      case 'analyzing':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`분석 중 (${progress}%)`}
              size="small"
              sx={{ bgcolor: '#3b82f6', color: 'white', fontSize: '12px' }}
            />
          </Box>
        );
      case 'pending':
        return <Chip label="대기 중" size="small" sx={{ bgcolor: '#6b7280', color: 'white', fontSize: '12px' }} />;
      case 'failed':
        return <Chip label="실패" size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontSize: '12px' }} />;
      default:
        return null;
    }
  };

  if (!project) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <Typography sx={{ color: '#6b7280' }}>프로젝트를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate('/monitoring')} sx={{ color: '#9ca3af' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ color: '#f9fafb', fontWeight: 700 }}>
          {project.name} - 분석 로그
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <CircularProgress sx={{ color: '#14b8a6' }} />
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            color: '#ef4444',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            오류 발생
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Box>
      ) : projectLogs.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            color: '#6b7280',
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '48px', mb: 2 }}>
            📋
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            분석 로그가 없습니다
          </Typography>
          <Typography variant="body2">분석을 시작하면 로그가 기록됩니다.</Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  분석 기간
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  도메인
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  분석종류
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  진행상황
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  요청시간
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #374151', fontWeight: 600 }}>
                  완료시간
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }}>{log.period}</TableCell>
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }}>{log.domain}</TableCell>
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }}>{log.analysisType}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #374151' }}>
                    <Box>
                      {getStatusChip(log.status, log.progress)}
                      {log.status === 'analyzing' && (
                        <LinearProgress
                          variant="determinate"
                          value={log.progress}
                          sx={{
                            mt: 1,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: '#374151',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#3b82f6',
                            },
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }}>
                    {formatDate(log.requestedAt)}
                  </TableCell>
                  <TableCell sx={{ color: '#f9fafb', borderBottom: '1px solid #374151' }}>
                    {formatDate(log.completedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
