import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Movies from './pages/movies/Movies';
import Users from './pages/users/Users';
import Genres from './pages/genres/Genres';
import Categories from './pages/categories/Categories';
import Comments from './pages/comments/Comments';
import Layout from './components/layout/Layout';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  },
});

function App() {
  const { user } = useContext(AuthContext);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/movies" 
              element={user ? (
                <Layout>
                  <Movies />
                </Layout>
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/users" 
              element={user ? (
                <Layout>
                  <Users />
                </Layout>
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/genres" 
              element={user ? (
                <Layout>
                  <Genres />
                </Layout>
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/categories" 
              element={user ? (
                <Layout>
                  <Categories />
                </Layout>
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/comments" 
              element={user ? (
                <Layout>
                  <Comments />
                </Layout>
              ) : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;