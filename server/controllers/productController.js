const Product = require('../models/Product');

// @desc  Get all products (with filters, search, pagination)
// @route GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12, featured, flashSale } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.discountedPrice = {};
      if (minPrice) query.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
    }
    if (featured === 'true') query.isFeatured = true;
    if (flashSale === 'true') query.isFlashSale = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { discountedPrice: 1 };
    else if (sort === 'price-desc') sortOption = { discountedPrice: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'popular') sortOption = { numReviews: -1 };
    else if (sort === 'discount') sortOption = { discountPercentage: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single product
// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc  Create product (Admin)
// @route POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    next(error);
  }
};

// @desc  Update product (Admin)
// @route PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete product (Admin)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Add review
// @route POST /api/products/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();

    res.status(201).json({ success: true, message: 'Review added', reviews: product.reviews });
  } catch (error) {
    next(error);
  }
};

// @desc  Get categories
// @route GET /api/products/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, categories: categories.sort() });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview, getCategories };
