require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const iphoneExamples = [
  {
    title: 'APPLE iPhone 17 Pro Max (Cosmic Orange, 2 TB)',
    description:
      'Example flagship listing for Wistoria: iPhone 17 Pro Max in Cosmic Orange with 2 TB storage, Pro camera system, premium display, and high-performance Apple silicon.',
    category: 'smartphones',
    brand: 'Apple',
    price: 159999,
    discountPercentage: 0,
    discountedPrice: 159999,
    stock: 25,
    images: [
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-pro-finish-select-202509-6-9inch-cosmicorange?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1757698187515',
    ],
    thumbnail:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-pro-finish-select-202509-6-9inch-cosmicorange?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1757698187515',
    rating: 4.9,
    numReviews: 128,
    tags: ['apple', 'iphone', 'iphone 17 pro max', '2tb', 'cosmic orange'],
    isFeatured: true,
    isFlashSale: false,
    sku: 'WISTORIA-IPHONE-17-PRO-MAX-2TB-COSMIC-ORANGE',
    weight: 233,
    dimensions: { width: 77.6, height: 163.4, depth: 8.75 },
  },
  {
    title: 'Apple iPhone 16 Pro, 512GB, Desert Titanium - Locked to AT&T (Renewed)',
    description:
      'Example renewed iPhone listing for Wistoria: iPhone 16 Pro in Desert Titanium with 512 GB storage, locked to AT&T, inspected and ready for everyday premium use.',
    category: 'smartphones',
    brand: 'Apple',
    price: 144999,
    discountPercentage: 0,
    discountedPrice: 144999,
    stock: 18,
    images: [
      'https://www.att.com/scmsassets/global/devices/phones/apple/apple-iphone-16-pro/defaultimage/desert-titanium-hero-zoom.png',
      'https://www.att.com/scmsassets/global/devices/phones/apple/apple-iphone-16-pro/carousel/desert-titanium-1.png',
      'https://www.att.com/scmsassets/global/devices/phones/apple/apple-iphone-16-pro/carousel/desert-titanium-2.png',
    ],
    thumbnail:
      'https://www.att.com/scmsassets/global/devices/phones/apple/apple-iphone-16-pro/defaultimage/desert-titanium-hero-zoom.png',
    rating: 4.7,
    numReviews: 96,
    tags: ['apple', 'iphone', 'iphone 16 pro', '512gb', 'desert titanium', 'renewed', 'at&t'],
    isFeatured: true,
    isFlashSale: false,
    sku: 'WISTORIA-IPHONE-16-PRO-512GB-DESERT-TITANIUM-ATT-RENEWED',
    weight: 199,
    dimensions: { width: 71.5, height: 149.6, depth: 8.25 },
  },
];

const seedIphoneExamples = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    throw new Error('MONGODB_URI or DATABASE_URL is required');
  }

  await mongoose.connect(mongoUri);

  for (const product of iphoneExamples) {
    await Product.findOneAndUpdate(
      { sku: product.sku },
      { $set: product },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
  }

  console.log(`Seeded ${iphoneExamples.length} iPhone example products`);
  await mongoose.disconnect();
};

seedIphoneExamples().catch(async (error) => {
  console.error('Failed to seed iPhone examples:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
