const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc  Create order
// @route POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'razorpay', paymentId, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Build order items
    const items = [];
    let subtotal = 0;
    for (const item of cart.items) {
      if (!item.product) continue;
      const itemTotal = item.product.discountedPrice * item.quantity;
      items.push({
        product: item.product._id,
        title: item.product.title,
        thumbnail: item.product.thumbnail,
        price: item.product.discountedPrice,
        quantity: item.quantity,
        total: itemTotal,
      });
      subtotal += itemTotal;
      // Reduce stock
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    const shippingCost = subtotal > 499 ? 0 : 49;
    const taxAmount = Math.round(subtotal * 0.05);
    const couponDiscount = cart.couponDiscount ? Math.round(subtotal * (cart.couponDiscount / 100)) : 0;
    const totalPrice = subtotal + shippingCost + taxAmount - couponDiscount;

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      shippingCost,
      taxAmount,
      discount: couponDiscount,
      totalPrice,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentId ? 'paid' : 'pending',
      paymentId,
      orderStatus: 'pending',
      couponCode,
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null, couponDiscount: 0 });

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc  Get my orders
// @route GET /api/orders
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments({ user: req.user._id }),
    ]);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Get order by ID
// @route GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel a shipped or delivered order' });
    }
    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: 'Cancelled by user' });
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

// ---- ADMIN ----

// @desc  Get all orders (Admin)
// @route GET /api/orders/admin/all
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { orderStatus: status } : {};
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Update order status (Admin)
// @route PUT /api/orders/admin/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });
    if (status === 'delivered') order.paymentStatus = 'paid';
    await order.save();
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

// @desc  Get admin dashboard stats
// @route GET /api/orders/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, pendingOrders, deliveredOrders, monthlySales] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
        { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        deliveredOrders,
        monthlySales,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getDashboardStats };
