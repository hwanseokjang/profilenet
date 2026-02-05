import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { logoutApi } from '../../services/api';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { text: '분석 설정 관리', icon: <SettingsIcon />, path: '/' },
  { text: '분석 모니터링', icon: <AssessmentIcon />, path: '/monitoring' },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutApi();
    clearAuth();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0f14' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: '#111827',
          borderBottom: '1px solid #374151',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            ProfileNet {'\uBD84\uC11D \uC2DC\uC2A4\uD15C'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {user?.name || user?.email}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: '#9ca3af',
                '&:hover': { color: '#14b8a6' },
              }}
            >
              <AccountIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: '#1f2937',
                border: '1px solid #374151',
                mt: 1,
              },
            }}
          >
            <MenuItem onClick={handleLogout} sx={{ color: '#f9fafb', gap: 1 }}>
              <LogoutIcon fontSize="small" />
              {'\uB85C\uADF8\uC544\uC6C3'}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#111827',
            borderRight: '1px solid #374151',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              color: '#f9fafb',
              fontWeight: 700,
              fontSize: '18px',
            }}
          >
            ProfileNet
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/edit'))}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    borderRight: '3px solid #14b8a6',
                    '& .MuiListItemIcon-root': {
                      color: '#14b8a6',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#14b8a6',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(55, 65, 81, 0.5)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#9ca3af', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ '& .MuiListItemText-primary': { color: '#f9fafb', fontSize: '14px' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          bgcolor: '#0a0f14',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
