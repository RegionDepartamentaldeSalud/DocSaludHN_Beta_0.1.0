import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LectorReciboPage from './pages/LectorReciboPage';
import TerminosPage from './pages/TerminosPage';
import UserPage from './pages/UserPage';
import MensajesPage from './pages/MensajesPage';
import DashboardPage from './pages/DashboardPage';
import ReceiptCreatorPage from './pages/ReceiptCreatorPage';
import PatientDetailPage from './pages/PatientDetailPage';

function App() {
  return (
    <Router>
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-w-full min-h-screen">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none"></div>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lector-recibo/:id" element={<LectorReciboPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/user_page" element={<UserPage />} />
          <Route path="/mensajes" element={<MensajesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/receipt-creator" element={<ReceiptCreatorPage />} />
          <Route path="/patient/:id" element={<PatientDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


