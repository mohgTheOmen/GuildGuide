import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const [avatar, setAvatar] = useState('');
  const [username, setUsername] = useState('MohgTheOmen');
  const [bio, setBio] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="settings-page">
      <div className="settings-container glass-panel">
        <h1 className="section-title">Account Settings</h1>
        <p className="section-subtitle">Update your profile and preferences</p>
        
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
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-outline">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
