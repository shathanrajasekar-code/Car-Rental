import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active City state (Defaults to Chennai for Tamil Nadu focus)
  const [activeCity, setActiveCityState] = useState(() => localStorage.getItem('activeCity') || 'Chennai');

  const setActiveCity = (city) => {
    localStorage.setItem('activeCity', city);
    setActiveCityState(city);
  };

  const detectLocationAndSetCity = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let closestCity = 'Chennai';
        let minDistance = Infinity;

        const cities = [
          { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
          { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
          { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
          { name: 'Trichy', lat: 10.7905, lon: 78.7047 },
          { name: 'Salem', lat: 11.6643, lon: 78.1460 },
          { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
          { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
          { name: 'Delhi', lat: 28.7041, lon: 77.1025 }
        ];

        cities.forEach((c) => {
          const dist = Math.sqrt(Math.pow(latitude - c.lat, 2) + Math.pow(longitude - c.lon, 2));
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = c.name;
          }
        });

        // Focus Tamil Nadu bounds
        const isTN = latitude >= 8.0 && latitude <= 13.6 && longitude >= 76.0 && longitude <= 80.5;
        if (isTN && !['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'].includes(closestCity)) {
          closestCity = 'Chennai';
        }

        setActiveCity(closestCity);
        alert(`📍 GPS Coordinates Detected!\nCoords: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})\nSetting your active city to: ${closestCity}`);
      },
      (error) => {
        alert('Could not access your location. Setting default city to Chennai.');
      }
    );
  };

  // Load user profile from stored token
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Session validation failed:', error.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    if (!localStorage.getItem('activeCity')) {
      setTimeout(() => {
        const confirmGPS = window.confirm(
          "Welcome to Bharath Rentals! 📍\n\nWould you like to grant location access to automatically find available self-drive vehicles near your city?"
        );
        if (confirmGPS) {
          detectLocationAndSetCity();
        } else {
          setActiveCity('Chennai');
        }
      }, 1000);
    }
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          role: response.data.role,
          drivingLicense: response.data.drivingLicense
        });
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Register customer action
  const register = async (name, email, phone, password, drivingLicense) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        drivingLicense
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          role: response.data.role,
          drivingLicense: response.data.drivingLicense
        });
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile action
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        // Update user state and store new token if returned
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          role: response.data.role,
          drivingLicense: response.data.drivingLicense
        });
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed.';
      return { success: false, message: msg };
    }
  };

  // Change password action
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/password', { currentPassword, newPassword });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Password update failed.';
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword, activeCity, setActiveCity, detectLocationAndSetCity }}>
      {children}
    </AuthContext.Provider>
  );
};
