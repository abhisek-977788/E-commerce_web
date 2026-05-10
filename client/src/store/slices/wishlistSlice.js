import { createSlice } from '@reduxjs/toolkit';

// Note: Actual wishlist toggling is done via authSlice since it's on the User model
// This slice just handles local UI state if needed, though we can mostly rely on auth.user.wishlist
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    loading: false,
  },
  reducers: {},
});

export default wishlistSlice.reducer;
