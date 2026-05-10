import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, User, Heart, Menu, Moon, Sun, LogOut } from 'lucide-react';
import { toggleSidebar, toggleCart, toggleTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { theme } = useSelector((state) => state.ui);

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full glass z-50 transition-all duration-300">
      <div className="page-container h-16 flex items-center justify-between gap-4">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button onClick={() => dispatch(toggleSidebar())} className="lg:hidden btn-icon">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-2xl font-display font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <span className="text-white text-xl">W</span>
            </div>
            <span className="gradient-text hidden sm:block">Wistoria</span>
          </Link>
        </div>

        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <input 
            type="text" 
            placeholder="Search products, categories..." 
            className="input-field pl-10 h-10 w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/products?search=${e.target.value}`);
            }}
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={() => dispatch(toggleTheme())} className="btn-icon hidden sm:block">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button className="btn-icon md:hidden">
            <Search className="w-5 h-5" />
          </button>

          <Link to="/wishlist" className="btn-icon relative">
            <Heart className="w-5 h-5" />
            {user?.wishlist?.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full" />
            )}
          </Link>

          <button onClick={() => dispatch(toggleCart())} className="btn-icon relative mr-2">
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="group relative">
              <div className="flex items-center gap-2 cursor-pointer btn-icon">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-primary-500/50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute right-0 mt-2 w-48 glass-dark rounded-xl shadow-card hidden group-hover:block overflow-hidden py-2 border border-white/10">
                <div className="px-4 py-2 border-b border-white/5 mb-2">
                  <p className="text-sm font-bold truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  Orders
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  <Heart className="w-4 h-4" /> Wishlist {user?.wishlist?.length > 0 && `(${user.wishlist.length})`}
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-2 border-t border-white/5 pt-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-4 text-sm hidden sm:block">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
