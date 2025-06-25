import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { loginCall, clearError } from '../../context/apiCalls';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Security,
  Dashboard,
  MovieFilter,
} from '@mui/icons-material';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isFetching, error, dispatch } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    const result = await loginCall({ email, password }, dispatch);
    
    if (!result.success) {
      setTimeout(() => {
        clearError(dispatch);
      }, 5000);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const adminFeatures = [
    {
      icon: <MovieFilter sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Управління контентом',
      description: 'Додавайте, редагуйте та модеруйте фільми, серіали та інший відеоконтент'
    },
    {
      icon: <Dashboard sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Аналітика та звіти',
      description: 'Відстежуйте статистику переглядів, доходи та активність користувачів'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Безпека системи',
      description: 'Контролюйте доступ, налаштування безпеки та резервне копіювання'
    }
  ];

  return (
    <div className="login-container">
      <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', width: '100%', minHeight: '600px' }}>
          {/* Ліва частина з інформацією */}
          <Box sx={{ 
            flex: 1, 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            borderRadius: '20px 0 0 20px',
            p: 4,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <AdminPanelSettings sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                BestFlix Admin
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Панель адміністратора
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />
            
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Можливості панелі:
            </Typography>
            
            {adminFeatures.map((feature, index) => (
              <Card key={index} sx={{ 
                mb: 2, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <Box sx={{ mr: 2 }}>{feature.icon}</Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          
          {/* Права частина з формою */}
          <Paper sx={{ 
            flex: 1, 
            borderRadius: '0 20px 20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4
          }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                  Авторизація
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Введіть облікові дані для доступу до панелі управління
                </Typography>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email адреса"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isFetching}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isFetching}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          disabled={isFetching}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isFetching || !email || !password}
                  sx={{ 
                    mb: 2, 
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    }
                  }}
                  startIcon={isFetching ? <CircularProgress size={20} color="inherit" /> : <AdminPanelSettings />}
                >
                  {isFetching ? 'Авторизація...' : 'Увійти в панель'}
                </Button>
              </form>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mt: 3,
                p: 2,
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(25, 118, 210, 0.2)'
              }}>
                <Security sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="body2" color="text.secondary">
                  Ваші дані захищені 256-бітним шифруванням SSL
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
}