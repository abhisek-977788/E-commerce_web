const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, lowercase: true },
    brand: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountedPrice: { type: Number },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }],
    thumbnail: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEnds: { type: Date },
    sku: { type: String, unique: true, sparse: true },
    weight: { type: Number },
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
    },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.discountPercentage > 0) {
    this.discountedPrice = Math.round(this.price * (1 - this.discountPercentage / 100));
  } else {
    this.discountedPrice = this.price;
  }
  next();
});

productSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
