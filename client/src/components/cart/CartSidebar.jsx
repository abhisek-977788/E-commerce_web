import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toggleCart, closeCart } from '../../store/slices/uiSlice';
import { updateCartItem, removeFromCart } from '../../store/slices/cartSlice';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartOpen } = useSelector(state => state.ui);
  const { cart, loading } = useSelector(state => state.cart);

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [cartOpen]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ productId, quantity: newQuantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/cart');
  };

  const cartSubtotal = cart?.items?.reduce((acc, item) => acc + (item.product.discountedPrice * item.quantity), 0) || 0;

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={() => dispatch(closeCart())}
      ></div>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] glass-dark z-[70] shadow-2xl flex flex-col transition-transform duration-300 transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-400" />
            Your Cart
          </h2>
          <button onClick={() => dispatch(closeCart())} className="btn-icon">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!cart?.items?.length ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg mb-4">Your cart is empty</p>
              <button 
                onClick={() => { dispatch(closeCart()); navigate('/products'); }}
                className="btn-primary"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item._id} className="cart-item relative pr-8">
                <img 
                  src={item.product.thumbnail} 
                  alt={item.product.title} 
                  className="w-20 h-20 object-contain rounded-lg bg-white/5 p-2"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1 mb-1">{item.product.title}</h4>
                  <div className="text-primary-400 font-bold text-sm mb-2">
                    ₹{item.product.discountedPrice?.toLocaleString('en-IN')}
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 bg-dark-900/50 rounded-lg w-fit px-2 py-1 border border-white/5">
                    <button 
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                      className="text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.product.stock || item.quantity >= 10}
                      className="text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRemove(item.product._id)}
                  disabled={loading}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart?.items?.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-dark-950">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-xl font-bold">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">Taxes and shipping calculated at checkout.</p>
            
            <button 
              onClick={handleCheckout}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// We need ArrowRight imported
import { ArrowRight } from 'lucide-react';

export default CartSidebar;
