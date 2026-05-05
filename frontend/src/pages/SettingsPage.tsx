import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { username: currentUsername, avatar: currentAvatar, bio: currentBio, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [avatar, setAvatar] = useState(currentAvatar || '');
  const [username, setUsername] = useState(currentUsername || '');
  const [bio, setBio] = useState(currentBio || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Sync with context if it changes elsewhere
  useEffect(() => {
    if (currentUsername) setUsername(currentUsername);
    if (currentAvatar) setAvatar(currentAvatar);
    if (currentBio) setBio(currentBio);
  }, [currentUsername, currentAvatar, currentBio]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    
    const loadingToast = toast.loading('Saving changes...');
    try {
      await updateProfile({ username, avatar, bio });
      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    const loadingToast = toast.loading('Updating password...');
    try {
      await changePassword(currentPassword, newPassword);
      toast.dismiss(loadingToast);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container glass-panel">
        <h1 className="section-title">Account Settings</h1>
        <p className="section-subtitle">Update your profile and preferences</p>
        
        <div className="settings-grid">
          <div className="settings-section">
            <h2>Profile Information</h2>
            <form className="settings-form" onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label htmlFor="avatar">Avatar URL</label>
                <input 
                  type="url" 
                  id="avatar" 
                  placeholder="https://example.com/avatar.jpg" 
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Enter your username"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea 
                  id="bio" 
                  rows={4} 
                  placeholder="Tell the community about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Profile</button>
            </form>
          </div>

          <div className="settings-section">
            <h2>Change Password</h2>
            <form className="settings-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-outline">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
