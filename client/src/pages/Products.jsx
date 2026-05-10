import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, pagination, categories, loading } = useSelector(state => state.products);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Parse filters from URL
  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({
      category: currentCategory,
      search: currentSearch,
      sort: currentSort,
      minPrice,
      maxPrice,
      page: currentPage,
      limit: 12
    }));
  }, [dispatch, currentCategory, currentSearch, currentSort, minPrice, maxPrice, currentPage]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="pt-24 pb-20 page-container">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {currentSearch ? `Search: ${currentSearch}` : currentCategory !== 'all' ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) : 'All Products'}
          </h1>
          <p className="text-gray-400 text-sm">
            Showing {products.length} of {pagination?.total || 0} products
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden btn-secondary py-2 px-4 flex items-center gap-2 text-sm"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {/* Sort Dropdown */}
          <select 
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="input-field py-2 px-4 w-auto bg-dark-800 text-sm cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8 items-start relative">
        
        {/* Sidebar Filters */}
        <aside className={`
          fixed inset-0 z-50 bg-dark-900/95 backdrop-blur-xl p-6 md:p-0 transition-transform duration-300 md:static md:block md:w-64 md:shrink-0 md:bg-transparent md:translate-x-0
          ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="md:sticky md:top-24 space-y-8 h-full md:h-auto overflow-y-auto no-scrollbar pb-20 md:pb-0">
            
            <div className="flex items-center justify-between md:hidden mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><SlidersHorizontal className="w-5 h-5"/> Filters</h2>
              <button onClick={() => setIsFilterOpen(false)} className="btn-icon"><X className="w-6 h-6" /></button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => updateFilters('category', 'all')}
                    className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${currentCategory === 'all' ? 'bg-primary-600/20 text-primary-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button 
                      onClick={() => updateFilters('category', cat)}
                      className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${currentCategory === cat ? 'bg-primary-600/20 text-primary-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Price Range</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Min (₹)</label>
                  <input 
                    type="number" 
                    value={minPrice} 
                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                    className="input-field py-2 px-3 text-sm" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Max (₹)</label>
                  <input 
                    type="number" 
                    value={maxPrice} 
                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                    className="input-field py-2 px-3 text-sm" 
                    placeholder="100000" 
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={clearFilters}
              className="w-full btn-secondary text-sm"
            >
              Clear All Filters
            </button>
            
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="h-80 skeleton"></div>)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination?.pages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <button 
                    disabled={!pagination.hasPrev}
                    onClick={() => updateFilters('page', (currentPage - 1).toString())}
                    className="btn-icon disabled:opacity-50 disabled:cursor-not-allowed bg-white/5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm font-medium">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button 
                    disabled={!pagination.hasNext}
                    onClick={() => updateFilters('page', (currentPage + 1).toString())}
                    className="btn-icon disabled:opacity-50 disabled:cursor-not-allowed bg-white/5"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 glass rounded-2xl">
              <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search term.</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;
