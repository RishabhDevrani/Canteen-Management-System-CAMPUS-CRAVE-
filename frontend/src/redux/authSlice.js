import { createSlice } from '@reduxjs/toolkit';

// Use sessionStorage so each tab can have an independent role/session (Admin in one tab, Customer in another, Kitchen in third)
const getStoredUser = () => {
  try {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    return null;
  }
};

const getStoredToken = () => {
  try {
    return sessionStorage.getItem('token') || localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

const storedToken = getStoredToken();

const initialState = {
  user: getStoredUser(),
  token: storedToken,
  isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Store in sessionStorage so each tab has its own isolated role
      sessionStorage.setItem('token', action.payload.token);
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      // Clear global localStorage to avoid cross-tab role collision
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

