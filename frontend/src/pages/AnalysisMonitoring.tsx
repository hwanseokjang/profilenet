import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import {
  Description as LogIcon,
  Assessment as ResultIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAnalysisStore } from '../store/analysisStore';
import { statusColors, statusLabels } from '../types/analysis';

export default function AnalysisMonitoring() {
  const navigate = useNavigate();
  const { projects, logs } = useAnalysisStore();

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yy.MM.dd HH:mm');
    } catch {
      return dateStr;
    }
  };

  const getProjectLogs = (projectId: string) => {
    return logs.filter((log) => log.projectId === projectId);
  };

  const getLatestProgress = (projectId: string) => {
    const projectLogs = getProjectLogs(projectId);
    const analyzingLog = projectLogs.find((l) => l.status === 'analyzing');
    return analyzingLog?.progress || 0;
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#f9fafb', fontWeight: 700, mb: 4 }}>
        분석 모니터링
      </Typography>

      {projects.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#6b7280',
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '64px', mb: 2 }}>
            📊
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            분석 프로젝트가 없습니다
          </Typography>
          <Typography variant="body2">
            먼저 분석 설정 관리에서 프로젝트를 생성해주세요.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
              <Card
                sx={{
                  bgcolor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: 2,
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

                  {project.status === 'analyzing' && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          진행률
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#14b8a6' }}>
                          {getLatestProgress(project.id)}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: '#374151',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${getLatestProgress(project.id)}%`,
                            bgcolor: '#14b8a6',
                            borderRadius: 4,
                            transition: 'width 0.3s',
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
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
                        분석 로그
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                        {getProjectLogs(project.id).length}건
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LogIcon />}
                      disabled={project.status === 'unavailable'}
                      onClick={() => navigate(`/monitoring/${project.id}/logs`)}
                      sx={{
                        flex: 1,
                        color: '#14b8a6',
                        borderColor: '#14b8a6',
                        '&:hover': {
                          borderColor: '#0d9488',
                          bgcolor: 'rgba(20, 184, 166, 0.1)',
                        },
                        '&.Mui-disabled': {
                          color: '#6b7280',
                          borderColor: '#374151',
                        },
                      }}
                    >
                      분석 로그
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ResultIcon />}
                      disabled={project.status !== 'available'}
                      onClick={() => navigate(`/results/${project.id}`)}
                      sx={{
                        flex: 1,
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
                      결과 확인
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
