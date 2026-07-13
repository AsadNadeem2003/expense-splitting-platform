import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  // Simple auth check stub. Will be replaced by real context.
  const isAuthenticated = true; 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" />
        }>
          <Route index element={<Dashboard />} />
          {/* Add more routes like groups, friends, settings here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
