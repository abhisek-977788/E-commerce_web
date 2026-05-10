require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Product = require('../models/Product');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    throw new Error('MONGODB_URI or DATABASE_URL is required');
  }

  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected for seeding');
};

const fetchAndSeedProducts = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Fetch from DummyJSON
    const response = await axios.get('https://dummyjson.com/products?limit=100&skip=0');
    const { products } = response.data;

    // Feature and flash sale flags
    const featuredCategories = ['smartphones', 'laptops', 'fragrances'];
    const flashSaleCategories = ['beauty', 'skin-care', 'groceries'];

    const productsToInsert = products.map((p) => {
      const discountedPrice = Math.round(p.price * (1 - p.discountPercentage / 100));
      return {
        title: p.title,
        description: p.description,
        category: p.category,
        brand: p.brand || 'Generic',
        price: p.price,
        discountPercentage: Math.round(p.discountPercentage),
        discountedPrice,
        stock: p.stock || Math.floor(Math.random() * 200) + 10,
        images: p.images || [p.thumbnail],
        thumbnail: p.thumbnail,
        rating: p.rating,
        numReviews: p.reviews?.length || Math.floor(Math.random() * 500) + 10,
        tags: p.tags || [p.category],
        isFeatured: featuredCategories.includes(p.category),
        isFlashSale: flashSaleCategories.includes(p.category),
        flashSaleEnds: flashSaleCategories.includes(p.category) ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        sku: `SKU-${p.id}-${Date.now()}`,
        weight: p.weight,
        dimensions: p.dimensions,
      };
    });

    await Product.insertMany(productsToInsert);
    console.log(`✅ Seeded ${productsToInsert.length} products`);

    // Fetch second batch
    const response2 = await axios.get('https://dummyjson.com/products?limit=94&skip=100');
    const products2 = response2.data.products;
    const batch2 = products2.map((p) => ({
      title: p.title,
      description: p.description,
      category: p.category,
      brand: p.brand || 'Generic',
      price: p.price,
      discountPercentage: Math.round(p.discountPercentage),
      discountedPrice: Math.round(p.price * (1 - p.discountPercentage / 100)),
      stock: p.stock || Math.floor(Math.random() * 200) + 10,
      images: p.images || [p.thumbnail],
      thumbnail: p.thumbnail,
      rating: p.rating,
      numReviews: p.reviews?.length || Math.floor(Math.random() * 500) + 10,
      tags: p.tags || [p.category],
      isFeatured: false,
      isFlashSale: Math.random() > 0.85,
      sku: `SKU-${p.id}-${Date.now()}-2`,
    }));

    await Product.insertMany(batch2);
    console.log(`✅ Seeded additional ${batch2.length} products`);
    console.log(`🎉 Total: ${productsToInsert.length + batch2.length} products seeded!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

fetchAndSeedProducts();
