import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Movie,
  People,
  Comment,
  Category,
  TrendingUp,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color: color }}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              <Typography variant="body2" color="success.main">
                +{trend}% цього місяця
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ color: color, opacity: 0.7 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalComments: 0,
    totalGenres: 0,
  });
  const [loading, setLoading] = useState(true);

  // Дані для графіків (заглушки)
  const monthlyData = [
    { name: 'Січ', users: 65, movies: 28 },
    { name: 'Лют', users: 59, movies: 48 },
    { name: 'Бер', users: 80, movies: 40 },
    { name: 'Кві', users: 81, movies: 19 },
    { name: 'Тра', users: 56, movies: 96 },
    { name: 'Чер', users: 55, movies: 27 },
  ];

  const genreData = [
    { name: 'Бойовик', value: 400, color: '#0088FE' },
    { name: 'Комедія', value: 300, color: '#00C49F' },
    { name: 'Драма', value: 300, color: '#FFBB28' },
    { name: 'Жахи', value: 200, color: '#FF8042' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Тут будуть реальні API виклики
        // const [moviesRes, usersRes, commentsRes, genresRes] = await Promise.all([
        //   api.get('/movies/stats'),
        //   api.get('/users/stats'),
        //   api.get('/comments/stats'),
        //   api.get('/genres/stats'),
        // ]);

        // Заглушка для демонстрації
        setTimeout(() => {
          setStats({
            totalMovies: 1234,
            totalUsers: 5678,
            totalComments: 9012,
            totalGenres: 24,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Помилка завантаження статистики:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Завантаження статистики...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управління
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Огляд основних показників системи
      </Typography>

      {/* Статистичні картки */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всього фільмів"
            value={stats.totalMovies.toLocaleString()}
            icon={<Movie sx={{ fontSize: 40 }} />}
            color="primary.main"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Користувачі"
            value={stats.totalUsers.toLocaleString()}
            icon={<People sx={{ fontSize: 40 }} />}
            color="success.main"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Коментарі"
            value={stats.totalComments.toLocaleString()}
            icon={<Comment sx={{ fontSize: 40 }} />}
            color="warning.main"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Жанри"
            value={stats.totalGenres}
            icon={<Category sx={{ fontSize: 40 }} />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Графіки */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Активність по місяцях
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#1976d2" name="Користувачі" />
                <Bar dataKey="movies" fill="#dc004e" name="Фільми" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Розподіл по жанрах
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}