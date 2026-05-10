import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/add', { productId, quantity });
    toast.success('Added to cart!');
    return data.cart;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to add');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/cart/update', { productId, quantity });
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/remove/${productId}`);
    toast.success('Removed from cart');
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart/clear');
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const applyCoupon = createAsyncThunk('cart/coupon', async (code, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/coupon', { code });
    toast.success(data.message);
    return data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Invalid coupon');
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    loading: false,
    couponDiscount: 0,
    couponCode: '',
  },
  reducers: {
    removeCoupon: (s) => { s.couponDiscount = 0; s.couponCode = ''; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, (s, a) => { s.loading = false; s.cart = a.payload; s.couponDiscount = a.payload?.couponDiscount || 0; s.couponCode = a.payload?.couponCode || ''; })
      .addCase(fetchCart.rejected, (s) => { s.loading = false; })
      .addCase(addToCart.fulfilled, (s, a) => { s.cart = a.payload; })
      .addCase(updateCartItem.fulfilled, (s, a) => { s.cart = a.payload; })
      .addCase(removeFromCart.fulfilled, (s, a) => { s.cart = a.payload; })
      .addCase(clearCart.fulfilled, (s) => { s.cart = null; s.couponDiscount = 0; s.couponCode = ''; })
      .addCase(applyCoupon.fulfilled, (s, a) => { s.couponDiscount = a.payload.discount; s.couponCode = a.meta.arg; });
  },
});

export const { removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
