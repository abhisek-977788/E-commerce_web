import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../store/slices/orderSlice';
import {
  Truck, CheckCircle, ArrowLeft,
  MapPin, CreditCard, ShoppingBag, IndianRupee,
} from 'lucide-react';

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const StatusBadge = ({ status }) => {
  const map = {
    pending:   'bg-warning-500/10 text-warning-400 border-warning-500/30',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    shipped:   'bg-primary-500/10 text-primary-400 border-primary-500/30',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border capitalize ${map[status] || 'bg-gray-500/10 text-gray-400'}`}>
      {status}
    </span>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder: order, loading } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(id)).unwrap().then(() => navigate('/orders')).catch(() => {});
    }
  };

  if (loading || !order || order._id !== id) {
    return (
      <div className="pt-24 pb-20 page-container">
        <div className="space-y-6 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const activeStep = order.orderStatus === 'cancelled' ? -1 : STEPS.indexOf(order.orderStatus);

  return (
    <div className="pt-24 pb-20 page-container">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Orders
        </button>
        <div className="ml-auto flex items-center gap-4">
          <StatusBadge status={order.orderStatus} />
          {['pending', 'confirmed'].includes(order.orderStatus) && (
            <button onClick={handleCancel} className="btn-danger py-2 text-sm">Cancel Order</button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          Order <span className="text-primary-400">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Progress Tracker */}
      {order.orderStatus !== 'cancelled' && (
        <div className="glass-card p-6 md:p-8 mb-6">
          <h2 className="font-bold text-lg mb-8 flex items-center gap-2"><Truck className="w-5 h-5 text-primary-400" /> Order Progress</h2>
          <div className="relative flex items-center justify-between">
            {/* connecting line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 -z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary-500 -z-0 transition-all duration-700"
              style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, idx) => {
              const done = idx <= activeStep;
              return (
                <div key={step} className="flex flex-col items-center gap-3 z-10 flex-1">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    done ? 'bg-primary-600 border-primary-500 shadow-glow' : 'bg-dark-900 border-white/20'
                  }`}>
                    {done
                      ? <CheckCircle className="w-5 h-5 text-white" />
                      : <div className="w-2.5 h-2.5 rounded-full bg-white/20" />}
                  </div>
                  <span className={`text-xs font-semibold capitalize text-center ${done ? 'text-primary-400' : 'text-gray-500'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center gap-2 font-bold">
              <ShoppingBag className="w-5 h-5 text-primary-400" /> Items Ordered ({order.items.length})
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item._id} className="p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 p-2 shrink-0">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product}`} className="font-medium hover:text-primary-400 transition-colors line-clamp-2 text-sm">
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-white">₹{item.total?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">₹{item.price?.toLocaleString('en-IN')} each</p>
                  </div>
                  {order.orderStatus === 'delivered' && (
                    <Link to={`/products/${item.product}#reviews`} className="btn-secondary py-1.5 px-3 text-xs hidden sm:block shrink-0">
                      Review
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-400" /> Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-300 space-y-1">
                <p className="font-semibold text-white">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : <p className="text-gray-500 text-sm">No address info</p>}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-primary-400" /> Price Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                  <span>- ₹{order.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Tax (5%)</span>
                <span>₹{order.taxAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? <span className="text-emerald-400">Free</span> : `₹${order.shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-lg border-t border-white/10 pt-3 mt-2">
                <span>Total</span>
                <span className="text-primary-400">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-400" /> Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Method</span>
                <span className="text-white capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={order.paymentStatus === 'paid' ? 'text-emerald-400 font-semibold' : 'text-warning-400 font-semibold'}>
                  {order.paymentStatus === 'paid' ? 'Paid ✓' : 'Pending'}
                </span>
              </div>
              {order.paymentId && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-500 text-xs">Payment ID</p>
                  <p className="text-gray-300 text-xs font-mono break-all mt-1">{order.paymentId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
