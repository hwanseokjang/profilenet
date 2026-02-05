import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import AnalysisManagement from './pages/AnalysisManagement';
import AnalysisEditor from './pages/AnalysisEditor';
import AnalysisMonitoring from './pages/AnalysisMonitoring';
import AnalysisLogs from './pages/AnalysisLogs';
import AnalysisResults from './pages/AnalysisResults';
import { useAuthStore } from './store/authStore';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#14b8a6',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#0a0f14',
      paper: '#1f2937',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<AnalysisManagement />} />
                    <Route path="/edit/:id" element={<AnalysisEditor />} />
                    <Route path="/monitoring" element={<AnalysisMonitoring />} />
                    <Route path="/monitoring/:id/logs" element={<AnalysisLogs />} />
                    <Route path="/results/:id" element={<AnalysisResults />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
