import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AnalysisCard from '../components/AnalysisCard/AnalysisCard';
import { useAnalysisStore } from '../store/analysisStore';

export default function AnalysisManagement() {
  const navigate = useNavigate();
  const { projects, createProject } = useAnalysisStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = () => {
    if (!newProjectName.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }
    const id = createProject(newProjectName.trim());
    setCreateDialogOpen(false);
    setNewProjectName('');
    navigate(`/edit/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#f9fafb', fontWeight: 700 }}>
          분석 설정 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            bgcolor: '#0f766e',
            '&:hover': {
              bgcolor: '#0d9488',
            },
          }}
        >
          새 분석 추가하기
        </Button>
      </Box>

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
            "새 분석 추가하기" 버튼을 클릭하여 첫 프로젝트를 만들어보세요.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
              <AnalysisCard project={project} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* 프로젝트 생성 다이얼로그 */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1f2937',
            color: '#f9fafb',
          },
        }}
      >
        <DialogTitle>새 분석 프로젝트</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="프로젝트 이름"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#f9fafb',
                '& fieldset': { borderColor: '#374151' },
                '&:hover fieldset': { borderColor: '#14b8a6' },
                '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
              },
              '& .MuiInputLabel-root': {
                color: '#9ca3af',
                '&.Mui-focused': { color: '#14b8a6' },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setNewProjectName('');
            }}
            sx={{ color: '#9ca3af' }}
          >
            취소
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            sx={{
              bgcolor: '#0f766e',
              '&:hover': {
                bgcolor: '#0d9488',
              },
            }}
          >
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
