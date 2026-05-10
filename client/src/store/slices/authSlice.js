import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/profile');
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', userData);
    toast.success('Profile updated!');
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    await api.put('/auth/change-password', passwords);
    toast.success('Password changed successfully!');
    return true;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to change password');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (addressData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/address', addressData);
    toast.success('Address added!');
    return data.addresses;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add address');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/auth/address/${addressId}`);
    toast.success('Address removed');
    return data.addresses;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to remove address');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/auth/wishlist/${productId}`);
    toast.success(data.message);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    passwordLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true; })
      .addCase(loginUser.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true; })
      .addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.user = a.payload; s.isAuthenticated = true; })
      .addCase(fetchProfile.rejected,  (s) => { s.user = null; s.isAuthenticated = false; localStorage.removeItem('token'); })
      .addCase(updateProfile.pending,   (s) => { s.loading = true; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(updateProfile.rejected,  (s) => { s.loading = false; })
      .addCase(changePassword.pending,   (s) => { s.passwordLoading = true; })
      .addCase(changePassword.fulfilled, (s) => { s.passwordLoading = false; })
      .addCase(changePassword.rejected,  (s) => { s.passwordLoading = false; })
      .addCase(addAddress.fulfilled,    (s, a) => { if (s.user) s.user.addresses = a.payload; })
      .addCase(deleteAddress.fulfilled, (s, a) => { if (s.user) s.user.addresses = a.payload; })
      .addCase(toggleWishlist.fulfilled, (s, a) => { if (s.user) s.user.wishlist = a.payload.wishlist; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
