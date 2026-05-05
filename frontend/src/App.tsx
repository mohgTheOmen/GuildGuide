import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import GuideDetailPage from './pages/GuideDetailPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CreateGuidePage from './pages/CreateGuidePage';
import EditGuidePage from './pages/EditGuidePage';
import DashboardPage from './pages/DashboardPage';
import InstantActionPage from './pages/InstantActionPage';
import SettingsPage from './pages/SettingsPage';
import GameHubPage from './pages/GameHubPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

const toastStyle = {
  style: {
    background: '#0f1629',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.07)',
  }
};

const AppLayout = () => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', background: 'var(--bg-primary)' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/guide/:id" element={<GuideDetailPage />} />
            <Route path="/community/:id" element={<CommunityPage />} />
            <Route path="/create-guide" element={<CreateGuidePage />} />
            <Route path="/edit-guide/:id" element={<EditGuidePage />} />
            <Route path="/instant-action" element={<InstantActionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/game/:gameId" element={<GameHubPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/guide/:id" element={<GuideDetailPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
        <Toaster position="bottom-right" toastOptions={toastStyle} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
