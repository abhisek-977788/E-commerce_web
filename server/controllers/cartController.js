const Cart = require('../models/Cart');
const Product = require('../models/Product');

const VALID_COUPONS = {
  SAVE10: 10,
  SAVE20: 20,
  SHOPKART50: 50,
  NEWUSER: 15,
};

// @desc  Get cart
// @route GET /api/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title thumbnail price discountedPrice discountPercentage stock images');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc  Add item to cart
// @route POST /api/cart/add
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < 1) return res.status(400).json({ success: false, message: 'Product out of stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = Math.min(cart.items[itemIndex].quantity + quantity, product.stock, 10);
      } else {
        cart.items.push({ product: productId, quantity: Math.min(quantity, product.stock, 10) });
      }
      await cart.save();
    }

    cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title thumbnail price discountedPrice discountPercentage stock images');
    res.json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc  Update cart item quantity
// @route PUT /api/cart/update
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Math.min(quantity, 10);
    }
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title thumbnail price discountedPrice discountPercentage stock images');
    res.json({ success: true, message: 'Cart updated', cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc  Remove item from cart
// @route DELETE /api/cart/remove/:productId
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title thumbnail price discountedPrice discountPercentage stock images');
    res.json({ success: true, message: 'Item removed', cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc  Clear cart
// @route DELETE /api/cart/clear
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null, couponDiscount: 0 });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

// @desc  Apply coupon
// @route POST /api/cart/coupon
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const discount = VALID_COUPONS[code?.toUpperCase()];
    if (!discount) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }
    await Cart.findOneAndUpdate({ user: req.user._id }, { couponCode: code.toUpperCase(), couponDiscount: discount });
    res.json({ success: true, message: `Coupon applied! ${discount}% off`, discount });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon };
