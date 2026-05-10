import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearCurrentProduct, fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/authSlice';
import ProductCard from '../components/product/ProductCard';
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, productLoading, items: relatedProducts } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const isWishlisted = user?.wishlist?.some(wId => 
    (typeof wId === 'string' ? wId : wId._id) === product?._id
  );

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => { dispatch(clearCurrentProduct()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setQuantity(1);
      // Fetch related products from same category
      dispatch(fetchProducts({ category: product.category, limit: 4 }));
    }
  }, [dispatch, product]);

  const handleAddToCart = () => {
    if (!product || product.stock < 1) return;
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  if (productLoading || !product) {
    return (
      <div className="pt-24 pb-20 page-container animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl bg-white/5"></div>
          <div className="space-y-6">
            <div className="h-10 bg-white/5 rounded w-3/4"></div>
            <div className="h-6 bg-white/5 rounded w-1/4"></div>
            <div className="h-20 bg-white/5 rounded w-full"></div>
            <div className="h-12 bg-white/5 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 page-container">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-white transition-colors capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square glass-card overflow-hidden relative flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                src={product.images[activeImage] || product.thumbnail} 
                alt={product.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-contain"
              />
            </AnimatePresence>
            
            {product.discountPercentage > 0 && (
              <div className="absolute top-4 left-4 badge-danger text-sm px-3 py-1">
                {product.discountPercentage}% OFF
              </div>
            )}
            
            <button 
              onClick={() => dispatch(toggleWishlist(product._id))}
              className="absolute top-4 right-4 p-3 rounded-full glass hover:bg-white/10 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-accent-500 text-accent-500' : 'text-gray-400'}`} />
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden glass p-2 transition-all duration-200 ${activeImage === idx ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900 bg-white/10' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-primary-400 font-medium tracking-wider uppercase text-sm">{product.brand || product.category}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 text-balance">
            {product.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 bg-accent-500/10 border border-accent-500/20 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-accent-500 fill-accent-500" />
              <span className="font-bold text-accent-500">{product.rating?.toFixed(1)}</span>
            </div>
            <a href="#reviews" className="text-sm text-gray-400 hover:text-white underline underline-offset-4 transition-colors">
              Read {product.numReviews} Reviews
            </a>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-white">₹{product.discountedPrice?.toLocaleString('en-IN')}</span>
              {product.discountPercentage > 0 && (
                <span className="text-xl text-gray-500 line-through mb-1">₹{product.price?.toLocaleString('en-IN')}</span>
              )}
            </div>
            <p className="text-sm text-gray-400">Inclusive of all taxes</p>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">
            {product.description}
          </p>

          <hr className="border-white/10 mb-8" />

          {/* Action Area */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-white">Quantity</span>
              {product.stock > 0 ? (
                <span className="text-emerald-400 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> In Stock ({product.stock} left)
                </span>
              ) : (
                <span className="text-red-400 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> Out of Stock
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between bg-dark-800 rounded-xl px-4 py-3 sm:w-32 border border-white/5">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                  disabled={product.stock < 1 || quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                  disabled={product.stock < 1 || quantity >= product.stock || quantity >= 10}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock < 1}
                className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> 
                {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto">
            <div className="flex flex-col items-center justify-center p-4 glass rounded-xl text-center">
              <Truck className="w-6 h-6 text-primary-400 mb-2" />
              <span className="text-xs font-medium text-gray-300">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 glass rounded-xl text-center">
              <RotateCcw className="w-6 h-6 text-primary-400 mb-2" />
              <span className="text-xs font-medium text-gray-300">7 Days Return</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 glass rounded-xl text-center">
              <ShieldCheck className="w-6 h-6 text-primary-400 mb-2" />
              <span className="text-xs font-medium text-gray-300">1 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Area */}
      <div className="mb-20" id="reviews">
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-lg font-medium whitespace-nowrap transition-colors relative ${activeTab === 'description' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
          >
            Full Description
            {activeTab === 'description' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-lg font-medium whitespace-nowrap transition-colors relative ${activeTab === 'reviews' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
          >
            Reviews ({product.numReviews})
            {activeTab === 'reviews' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400" />
            )}
          </button>
        </div>

        <div className="min-h-[200px]">
          {activeTab === 'description' ? (
            <div className="prose prose-invert max-w-none text-gray-300">
              <p className="text-lg leading-relaxed mb-6">{product.description}</p>
              
              <h3 className="text-xl font-bold text-white mb-4 mt-8">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-gray-400">Brand</span>
                  <span className="font-medium">{product.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-gray-400">Category</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-gray-400">SKU</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-gray-400">Weight</span>
                  <span className="font-medium">{product.weight ? `${product.weight}g` : 'N/A'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <div className="glass-card p-6 text-center sticky top-24">
                  <div className="text-6xl font-bold text-white mb-2">{product.rating?.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'text-accent-500 fill-accent-500' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <p className="text-gray-400">Based on {product.numReviews} reviews</p>
                  
                  {user ? (
                    <button className="btn-primary w-full mt-6">Write a Review</button>
                  ) : (
                    <p className="text-sm text-gray-500 mt-6 pt-6 border-t border-white/10">Please login to write a review</p>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review, idx) => (
                    <div key={idx} className="glass p-6 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold">
                            {review.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{review.name}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt || new Date()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-accent-500 fill-accent-500' : 'text-gray-700'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 glass rounded-2xl">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts?.filter(p => p._id !== product._id).length > 0 && (
        <section>
          <h2 className="section-title mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.filter(p => p._id !== product._id).slice(0, 4).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
