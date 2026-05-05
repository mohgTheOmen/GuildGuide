import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  login: (username: string) => void;
  logout: () => void;
  updateProfile: (data: { username?: string, avatar?: string, bio?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });
  const [avatar, setAvatar] = useState<string | null>(() => {
    return localStorage.getItem('userAvatar');
  });
  const [bio, setBio] = useState<string | null>(() => {
    return localStorage.getItem('userBio') || "No bio.";
  });

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
        setAvatar(data.avatarUrl);
        setBio(data.bio || "No bio.");
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (username) localStorage.setItem('username', username);
    if (avatar) localStorage.setItem('userAvatar', avatar);
    if (bio) localStorage.setItem('userBio', bio);
  }, [isLoggedIn, username, avatar, bio]);

  const login = (name: string) => {
    setIsLoggedIn(true);
    setUsername(name);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setAvatar(null);
    setBio(null);
    localStorage.clear();
  };

  const updateProfile = async (data: { username?: string, avatar?: string, bio?: string }) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: data.username,
          avatarUrl: data.avatar,
          bio: data.bio
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setUsername(updated.username);
        setAvatar(updated.avatarUrl);
        setBio(updated.bio || "No bio.");
      }
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('http://localhost:8080/api/users/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to change password');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, avatar, bio, login, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
