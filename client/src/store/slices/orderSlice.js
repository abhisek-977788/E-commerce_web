import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData);
    toast.success('Order placed successfully! 🎉');
    return data.order;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to place order');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/cancel`);
    toast.success('Order cancelled');
    return data.order;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Cannot cancel order');
    return rejectWithValue(err.response?.data?.message);
  }
});

// Admin
export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/admin/all', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/admin/${id}/status`, { status, note });
    toast.success('Order status updated');
    return data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchDashboardStats = createAsyncThunk('orders/stats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/admin/stats');
    return data.stats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    allOrders: [],
    stats: null,
    loading: false,
    total: 0,
    pages: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (s) => { s.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload.orders; s.total = a.payload.total; s.pages = a.payload.pages; })
      .addCase(fetchMyOrders.rejected, (s) => { s.loading = false; })
      .addCase(fetchOrderById.fulfilled, (s, a) => { s.currentOrder = a.payload; })
      .addCase(createOrder.fulfilled, (s, a) => { s.currentOrder = a.payload; s.orders.unshift(a.payload); })
      .addCase(cancelOrder.fulfilled, (s, a) => { const idx = s.orders.findIndex(o => o._id === a.payload._id); if (idx > -1) s.orders[idx] = a.payload; if (s.currentOrder?._id === a.payload._id) s.currentOrder = a.payload; })
      .addCase(fetchAllOrders.fulfilled, (s, a) => { s.allOrders = a.payload.orders; s.total = a.payload.total; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => { const idx = s.allOrders.findIndex(o => o._id === a.payload._id); if (idx > -1) s.allOrders[idx] = a.payload; })
      .addCase(fetchDashboardStats.fulfilled, (s, a) => { s.stats = a.payload; });
  },
});

export default orderSlice.reducer;
