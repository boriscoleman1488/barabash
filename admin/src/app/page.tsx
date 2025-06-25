'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Перевіряємо чи є збережений токен
    const savedToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { accessToken, ...userData } = response;
        
        // Перевіряємо чи користувач є адміністратором
        if (!userData.isAdmin) {
          setError('Доступ заборонено. Потрібні права адміністратора.');
          return;
        }

        setToken(accessToken);
        setUser(userData);
        setIsLoggedIn(true);
        
        // Зберігаємо в localStorage
        localStorage.setItem('adminToken', accessToken);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        
        setEmail('');
        setPassword('');
      } else {
        setError(response.message || 'Помилка авторизації');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка підключення до сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken('');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Токен скопійовано в буфер обміну!');
  };

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Адміністративна панель BestFlix
                </h1>
                <p className="text-gray-600 mt-1">
                  Ласкаво просимо, {user.firstName || user.username}!
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Вийти
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Інформація про користувача
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {user._id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <div className="mt-1 flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isAdmin ? 'Адміністратор' : 'Користувач'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Активний' : 'Неактивний'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Token Display */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Access Token
              </h2>
              <button
                onClick={copyToken}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Копіювати
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border">
              <code className="text-sm text-gray-800 break-all font-mono">
                {token}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Використовуйте цей токен для авторизації API запитів
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            BestFlix Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Увійдіть в адміністративну панель
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email адреса"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}