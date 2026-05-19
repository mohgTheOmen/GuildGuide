import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

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
import AdminPanelPage from './pages/AdminPanelPage';
import GameHubPage from './pages/GameHubPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminRoute from './components/AdminRoute';
import './App.css';

const toastStyle = {
  style: {
    background: '#0f1629',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.07)',
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/guide/:id" element={<GuideDetailPage />} />
              <Route path="/community/:id" element={<CommunityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Content Creation Routes */}
              <Route path="/create-guide" element={<CreateGuidePage />} />
              <Route path="/edit-guide/:id" element={<EditGuidePage />} />
              <Route path="/instant-action" element={<InstantActionPage />} />
              
              {/* User Management Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanelPage />} />
              </Route>

              {/* Discovery & Error Handling Routes */}
              <Route path="/game/:gameId" element={<GameHubPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
        <Toaster position="bottom-right" toastOptions={toastStyle} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
