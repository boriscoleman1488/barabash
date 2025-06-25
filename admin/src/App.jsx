import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import AdminLogin from "./pages/login/AdminLogin";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <AdminLogin /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={user ? <div>Admin Dashboard</div> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
