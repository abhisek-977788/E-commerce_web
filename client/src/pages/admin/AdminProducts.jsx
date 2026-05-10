import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, X, Save } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';

const EMPTY_PRODUCT = {
  title: '', description: '', category: '', brand: '',
  price: '', discountedPrice: '', discountPercentage: '',
  stock: '', thumbnail: '', images: '',
  isFeatured: false, isFlashSale: false,
};

const ProductModal = ({ product, onClose, onSaved }) => {
  const isEdit = !!product?._id;
  const [form, setForm] = useState(() => {
    if (!product) return EMPTY_PRODUCT;
    return {
      ...product,
      images: Array.isArray(product.images) ? product.images.join(', ') : product.images || '',
    };
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountedPrice: Number(form.discountedPrice),
        discountPercentage: Number(form.discountPercentage),
        stock: Number(form.stock),
        images: form.images
          ? form.images.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      if (isEdit) {
        await api.put(`/products/${product._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, required, className = '' }) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}{required && ' *'}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        step={type === 'number' ? 'any' : undefined}
        min={type === 'number' ? 0 : undefined}
        className="input-field w-full text-sm"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Preview thumbnail */}
          {form.thumbnail && (
            <div className="mb-6 flex justify-center">
              <img
                src={form.thumbnail}
                alt="Preview"
                className="w-24 h-24 object-contain rounded-xl bg-white/5 border border-white/10 p-2"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" name="title" required placeholder="iPhone 14 Pro" className="sm:col-span-2" />
            <Field label="Brand" name="brand" required placeholder="Apple" />
            <Field label="Category" name="category" required placeholder="smartphones" />
            <Field label="Original Price (₹)" name="price" type="number" required placeholder="89999" />
            <Field label="Discounted Price (₹)" name="discountedPrice" type="number" required placeholder="79999" />
            <Field label="Discount %" name="discountPercentage" type="number" placeholder="10" />
            <Field label="Stock" name="stock" type="number" required placeholder="50" />
            <Field label="Thumbnail URL" name="thumbnail" required placeholder="https://..." className="sm:col-span-2" />
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Extra Image URLs <span className="normal-case text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="images"
                value={form.images}
                onChange={handleChange}
                placeholder="https://img1.jpg, https://img2.jpg"
                className="input-field w-full text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Product description..."
                className="input-field w-full text-sm resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFeatured" name="isFeatured" checked={!!form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-indigo-500" />
              <label htmlFor="isFeatured" className="text-sm text-gray-300">Featured product</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFlashSale" name="isFlashSale" checked={!!form.isFlashSale} onChange={handleChange} className="w-4 h-4 accent-red-500" />
              <label htmlFor="isFlashSale" className="text-sm text-gray-300">Flash Sale</label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" form="product-form" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</>
              : <><Save className="w-4 h-4" /> {isEdit ? 'Update Product' : 'Create Product'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────── */

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector(state => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const reload = useCallback(() => dispatch(fetchProducts({ limit: 100 })), [dispatch]);

  useEffect(() => { reload(); }, [reload]);

  const openCreate = () => { setEditProduct(null); setModalOpen(true); };
  const openEdit   = (product) => { setEditProduct(product); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditProduct(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      reload();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-dark-950">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-8 pt-24">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Products Management</h1>
            <p className="text-gray-400 text-sm">Manage your product catalog, pricing, and inventory.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus className="w-5 h-5" /> Add New Product
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-10 w-full text-sm"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
            <p className="text-gray-400 text-sm ml-auto">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4 font-medium w-16">Image</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Flags</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="p-4"><div className="h-4 skeleton rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-500">
                      {searchTerm ? 'No products match your search.' : 'No products found. Add your first product!'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(product => (
                    <tr key={product._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <img src={product.thumbnail} alt={product.title} className="w-12 h-12 rounded-lg object-contain bg-white/5 p-1 border border-white/10" />
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <p className="font-medium text-white line-clamp-1 text-sm">{product.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                      </td>
                      <td className="p-4 text-gray-300 capitalize text-sm">{product.category}</td>
                      <td className="p-4">
                        <p className="font-medium text-white text-sm">₹{product.discountedPrice?.toLocaleString()}</p>
                        {product.discountPercentage > 0 && (
                          <p className="text-xs text-emerald-400">{Math.round(product.discountPercentage)}% off</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : product.stock > 0
                            ? 'bg-warning-500/10 text-warning-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {product.isFeatured && <span className="badge-primary text-[10px] px-2 py-0.5 w-fit">Featured</span>}
                          {product.isFlashSale && <span className="badge-danger text-[10px] px-2 py-0.5 w-fit">Flash Sale</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => openEdit(product)}
                          title="Edit"
                          className="p-2 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors inline-flex"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          title="Delete"
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors inline-flex"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          onClose={closeModal}
          onSaved={reload}
        />
      )}
    </div>
  );
};

export default AdminProducts;
