import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { createProtectedRoute } from '../utils';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {createProtectedRoute('/', <Home />)}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
