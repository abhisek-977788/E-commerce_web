import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/authSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const isWishlisted = user?.wishlist?.some(id => 
    (typeof id === 'string' ? id : id._id) === product._id
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return; // Maybe trigger login modal
    dispatch(toggleWishlist(product._id));
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card group block h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discountPercentage > 0 && (
          <span className="badge-danger">-{product.discountPercentage}%</span>
        )}
        {product.isFlashSale && (
          <span className="badge-warning">Flash Sale</span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 
          ${isWishlisted ? 'bg-accent-500 text-white' : 'bg-dark-900/40 text-gray-300 hover:bg-dark-900/60 hover:text-white'}`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image */}
      <div className="relative w-full pt-[100%] overflow-hidden bg-white/5">
        <img 
          src={product.thumbnail} 
          alt={product.title} 
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="stars text-accent-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold text-white ml-1">{product.rating?.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-500">({product.numReviews})</span>
        </div>

        <h3 className="font-semibold text-white truncate mb-1" title={product.title}>
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-400 capitalize mb-4">{product.category}</p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="price-current">₹{product.discountedPrice?.toLocaleString('en-IN')}</div>
            {product.discountPercentage > 0 && (
              <div className="price-original">₹{product.price?.toLocaleString('en-IN')}</div>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className={`p-3 rounded-xl transition-all duration-200 shadow-lg active:scale-95
              ${product.stock < 1 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/25 hover:shadow-primary-500/40'}`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
