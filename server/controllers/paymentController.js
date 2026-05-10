const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc  Create Razorpay order
// @route POST /api/payment/create-order
const createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.json({ 
      success: true, 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify payment signature
// @route POST /api/payment/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({ success: true, message: 'Payment verified successfully', paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment };
