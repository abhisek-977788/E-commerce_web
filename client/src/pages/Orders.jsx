import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, cancelOrder } from '../store/slices/orderSlice';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';

const OrderStatusIcon = ({ status }) => {
  switch (status) {
    case 'pending': return <Clock className="w-5 h-5 text-warning-400" />;
    case 'confirmed': return <CheckCircle className="w-5 h-5 text-info-400" />;
    case 'shipped': return <Truck className="w-5 h-5 text-primary-400" />;
    case 'delivered': return <CheckCircle className="w-5 h-5 text-success-400" />;
    case 'cancelled': return <XCircle className="w-5 h-5 text-danger-400" />;
    default: return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders({ limit: 20 }));
  }, [dispatch]);

  const handleCancel = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(orderId));
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 page-container flex justify-center">
        <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="pt-32 pb-20 page-container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">No Orders Yet</h2>
        <p className="text-gray-400 mb-8 max-w-md text-center">You haven't placed any orders. Start shopping to see your history here.</p>
        <Link to="/products" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 page-container">
      <h1 className="text-3xl font-display font-bold text-white mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="glass-card overflow-hidden">
            
            {/* Order Header */}
            <div className="p-4 sm:p-6 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-sm font-medium">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order #</p>
                  <p className="text-sm font-medium text-primary-400">{order.orderNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900 border border-white/10 text-sm capitalize">
                <OrderStatusIcon status={order.orderStatus} />
                <span className={`font-semibold status-${order.orderStatus} !bg-transparent !border-0 !p-0`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 sm:p-6 space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 p-2 shrink-0">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product}`} className="font-medium hover:text-primary-400 transition-colors line-clamp-1">
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-400 mt-1">Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  {['delivered'].includes(order.orderStatus) && (
                    <Link to={`/products/${item.product}#reviews`} className="btn-secondary py-1.5 px-3 text-xs hidden sm:block">
                      Write Review
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Order Footer Actions */}
            <div className="p-4 sm:p-6 bg-dark-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                <span className="font-medium text-white">Payment: </span> 
                {order.paymentMethod === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}
              </div>
              
              <div className="flex gap-3">
                {['pending', 'confirmed'].includes(order.orderStatus) && (
                  <button 
                    onClick={() => handleCancel(order._id)}
                    className="btn-danger py-2 text-sm"
                  >
                    Cancel Order
                  </button>
                )}
                <Link to={`/orders/${order._id}`} className="btn-secondary py-2 text-sm flex items-center gap-1">
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
