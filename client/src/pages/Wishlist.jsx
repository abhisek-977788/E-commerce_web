import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProfile, toggleWishlist } from '../store/slices/authSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Heart, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const wishlist = user?.wishlist || [];

  const handleRemove = (productId) => dispatch(toggleWishlist(productId));

  const handleAddToCart = (productId) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-80 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-400 fill-red-400" /> My Wishlist
          </h1>
          <p className="text-gray-400 text-sm mt-1">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
        </div>
        {wishlist.length > 0 && (
          <Link to="/products" className="btn-secondary flex items-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-8 max-w-sm">Save items you love by clicking the heart icon on any product.</p>
          <Link to="/products" className="btn-primary flex items-center gap-2">
            Explore Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass-card overflow-hidden group"
            >
              {/* Image */}
              <Link to={`/products/${product._id}`} className="block relative overflow-hidden bg-white/5 aspect-square">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                )}
                {/* Remove from wishlist */}
                <button
                  onClick={(e) => { e.preventDefault(); handleRemove(product._id); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link to={`/products/${product._id}`} className="font-medium text-sm text-gray-200 line-clamp-2 hover:text-primary-400 transition-colors mb-3 block">
                  {product.title}
                </Link>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-white text-lg">
                    ₹{product.discountedPrice?.toLocaleString('en-IN')}
                  </span>
                  {product.price > product.discountedPrice && (
                    <span className="text-gray-500 text-sm line-through">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product._id)}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
