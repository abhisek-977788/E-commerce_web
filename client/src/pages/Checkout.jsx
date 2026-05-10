import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../store/slices/orderSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product.discountedPrice * item.quantity), 0) || 0;
  const shippingCost = subtotal > 499 ? 0 : 49;
  const taxAmount = Math.round(subtotal * 0.05);
  const discount = cart?.couponDiscount ? Math.round(subtotal * (cart.couponDiscount / 100)) : 0;
  const totalAmount = subtotal + shippingCost + taxAmount - discount;

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const initPayment = async (e) => {
    e.preventDefault();
    if (!cart?.items?.length) return toast.error('Your cart is empty');
    
    // Basic validation
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return toast.error('Please fill in all required address fields');
    }

    setLoading(true);
    try {
      // 1. Create order on server (Razorpay)
      const { data } = await api.post('/payment/create-order', {
        amount: totalAmount,
        currency: 'INR'
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Wistoria',
        description: 'Premium Product Purchase',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyData = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.data.success) {
              // 4. Create internal order
              await dispatch(createOrder({
                shippingAddress,
                paymentMethod: 'razorpay',
                paymentId: response.razorpay_payment_id,
                couponCode: cart?.couponCode,
              })).unwrap();

              navigate('/orders');
            }
          } catch {
            toast.error('Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error(response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch {
      toast.error('Could not initiate payment');
      setLoading(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <div className="pt-24 page-container text-center">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <p className="text-gray-400">Your cart is empty.</p>
        <button onClick={() => navigate('/products')} className="btn-primary mt-6">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 page-container">
      <h1 className="text-3xl font-display font-bold mb-8 text-white">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Address Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-sm">1</span>
              Shipping Address
            </h2>
            
            <form id="checkout-form" onSubmit={initPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Full Name *</label>
                <input type="text" name="name" required value={shippingAddress.name} onChange={handleInputChange} className="input-field" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Phone *</label>
                <input type="tel" name="phone" required value={shippingAddress.phone} onChange={handleInputChange} className="input-field" placeholder="9876543210" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-400">Address Line 1 *</label>
                <input type="text" name="addressLine1" required value={shippingAddress.addressLine1} onChange={handleInputChange} className="input-field" placeholder="House/Flat No, Building Name" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-400">Address Line 2</label>
                <input type="text" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleInputChange} className="input-field" placeholder="Street, Area, Landmark" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">City *</label>
                <input type="text" name="city" required value={shippingAddress.city} onChange={handleInputChange} className="input-field" placeholder="Mumbai" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">State *</label>
                <input type="text" name="state" required value={shippingAddress.state} onChange={handleInputChange} className="input-field" placeholder="Maharashtra" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Pincode *</label>
                <input type="text" name="pincode" required value={shippingAddress.pincode} onChange={handleInputChange} className="input-field" placeholder="400001" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Country</label>
                <input type="text" name="country" value={shippingAddress.country} disabled className="input-field opacity-50 cursor-not-allowed" />
              </div>
            </form>
          </div>
          
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-sm">2</span>
              Payment Method
            </h2>
            <div className="p-4 border border-primary-500/50 bg-primary-500/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary-400" />
                <span className="font-semibold text-white">Razorpay Secure</span>
              </div>
              <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500 mt-3 pl-1">Cards, UPI, NetBanking, and Wallets supported.</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar mb-6 border-b border-white/10 pb-6">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-start gap-3">
                  <img src={item.product.thumbnail} alt={item.product.title} className="w-12 h-12 object-contain bg-white/5 rounded p-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 line-clamp-1">{item.product.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-sm font-semibold">₹{(item.product.discountedPrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 text-sm">
                  <span>Coupon Discount ({cart.couponCode})</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Tax (5%)</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <span className="text-emerald-400">Free</span> : `₹${shippingCost}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-6">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-primary-400">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Pay ₹{totalAmount.toLocaleString('en-IN')} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secure checkout powered by Razorpay
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
