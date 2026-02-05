import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { loginApi } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('\uC774\uBA54\uC77C\uACFC \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginApi({ email, password });

      if (response.success && response.user && response.token) {
        setAuth(response.user, response.token);
        navigate('/');
      } else {
        setError(response.message || '\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.');
      }
    } catch (err) {
      setError('\uB85C\uADF8\uC778 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f172a',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: '#1f2937',
          border: '1px solid #374151',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#14b8a6', fontWeight: 700, mb: 1 }}>
              ProfileNet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {'\uC18C\uC15C \uBBF8\uB514\uC5B4 \uBD84\uC11D \uD50C\uB7AB\uD3FC'}
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label={'\uC774\uBA54\uC77C'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{
                mb: 2,
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

            <TextField
              fullWidth
              label={'\uBE44\uBC00\uBC88\uD638'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{
                mb: 3,
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

            {error && (
              <Alert severity="error" sx={{ mb: 2, bgcolor: '#7f1d1d', color: '#fecaca' }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<LoginIcon />}
              disabled={loading}
              sx={{
                bgcolor: '#0f766e',
                '&:hover': { bgcolor: '#0d9488' },
                '&.Mui-disabled': {
                  bgcolor: '#374151',
                  color: '#6b7280',
                },
              }}
            >
              {loading ? '\uB85C\uADF8\uC778 \uC911...' : '\uB85C\uADF8\uC778'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {'\uD14C\uC2A4\uD2B8 \uACC4\uC815: test@example.com / test123'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
