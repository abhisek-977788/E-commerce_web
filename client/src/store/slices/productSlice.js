import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found');
  }
});

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/categories');
    return data.categories;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addProductReview = createAsyncThunk('products/addReview', async ({ id, reviewData }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/products/${id}/reviews`, reviewData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// Admin
export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', productData);
    return data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data: productData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/products/${id}`, productData);
    return data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    categories: [],
    pagination: null,
    loading: false,
    productLoading: false,
    error: null,
    filters: { search: '', category: 'all', sort: 'newest', minPrice: '', maxPrice: '' },
  },
  reducers: {
    setFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    clearCurrentProduct: (s) => { s.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.products; s.pagination = a.payload.pagination; })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProductById.pending, (s) => { s.productLoading = true; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.productLoading = false; s.currentProduct = a.payload; })
      .addCase(fetchProductById.rejected, (s, a) => { s.productLoading = false; s.error = a.payload; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload; })
      .addCase(deleteProduct.fulfilled, (s, a) => { s.items = s.items.filter((p) => p._id !== a.payload); })
      .addCase(updateProduct.fulfilled, (s, a) => { const idx = s.items.findIndex(p => p._id === a.payload._id); if (idx > -1) s.items[idx] = a.payload; if (s.currentProduct?._id === a.payload._id) s.currentProduct = a.payload; });
  },
});

export const { setFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
