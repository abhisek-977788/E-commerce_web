import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItem, removeFromCart, applyCoupon, removeCoupon } from '../store/slices/cartSlice';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Tag, ArrowLeft, X } from 'lucide-react';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading, couponDiscount, couponCode } = useSelector(state => state.cart);
  
  const [couponInput, setCouponInput] = useState('');

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ productId, quantity: newQuantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    dispatch(applyCoupon(couponInput.trim()));
    setCouponInput('');
  };

  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product.discountedPrice * item.quantity), 0) || 0;
  const discount = couponDiscount ? Math.round(subtotal * (couponDiscount / 100)) : 0;
  const taxAmount = Math.round(subtotal * 0.05);
  const shippingCost = subtotal > 499 ? 0 : 49;
  const totalAmount = subtotal + taxAmount + shippingCost - discount;

  if (!cart?.items?.length) {
    return (
      <div className="pt-32 pb-20 page-container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md text-center">Looks like you haven't added anything to your cart yet. Browse our products and discover great deals.</p>
        <Link to="/products" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 page-container">
      <h1 className="text-3xl font-display font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link to={`/products/${item.product._id}`} className="w-full sm:w-24 aspect-square rounded-xl bg-white/5 p-2 shrink-0">
                <img src={item.product.thumbnail} alt={item.product.title} className="w-full h-full object-contain" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <Link to={`/products/${item.product._id}`} className="font-semibold text-lg hover:text-primary-400 transition-colors line-clamp-2">
                    {item.product.title}
                  </Link>
                  <div className="text-xl font-bold text-white shrink-0">
                    ₹{item.product.discountedPrice?.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 capitalize mb-4">Category: {item.product.category}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-dark-800 rounded-lg w-fit px-3 py-1.5 border border-white/5">
                    <button 
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                      className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.product.stock || item.quantity >= 10}
                      className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => handleRemove(item.product._id)}
                    disabled={loading}
                    className="text-gray-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-between items-center">
            <Link to="/products" className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between text-gray-400">
                <span>Tax (5%)</span>
                <span className="text-white">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Shipping Estimate</span>
                <span className="text-white">{shippingCost === 0 ? <span className="text-emerald-400">Free</span> : `₹${shippingCost}`}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium pt-2">
                  <span>Discount ({couponCode})</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="mb-6 pt-4 border-t border-white/10">
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <Tag className="w-4 h-4" />
                    Coupon '{couponCode}' applied
                  </div>
                  <button onClick={() => dispatch(removeCoupon())} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code" 
                    className="input-field py-2 text-sm uppercase"
                  />
                  <button type="submit" disabled={!couponInput} className="btn-secondary py-2 px-4 text-sm">
                    Apply
                  </button>
                </form>
              )}
              <p className="text-xs text-gray-500 mt-2">Try: SAVE10, SAVE20, SHOPKART50</p>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-6 mb-8">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-3xl text-primary-400">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
