import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    cartOpen: false,
    theme: localStorage.getItem('theme') || 'dark',
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    closeCart: (state) => { state.cartOpen = false; },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

export const { toggleSidebar, toggleCart, closeCart, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
