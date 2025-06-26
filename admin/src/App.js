import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Users from "./pages/users/Users";
import Genres from "./pages/genres/Genres";
import Categories from "./pages/categories/Categories";
import Movies from "./pages/movies/Movies";
import Payments from "./pages/payments/Payments";

import { useContext } from "react";
import { AuthContext } from "./context/authContext/AuthContext";

function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/users" 
          element={user ? <Users /> : <Navigate to="/login" />} 
        />
        <Route
          path="/genres"
          element={user ? <Genres /> : <Navigate to="/login" />}
        />
        <Route 
          path="/categories" 
          element={user ? <Categories /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/movies" 
          element={user ? <Movies /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/payments" 
          element={user ? <Payments /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;