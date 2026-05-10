import { useEffect, useState } from 'react';

// Real countdown — persists 12 h from first visit
const SALE_END_KEY = 'wistoria_sale_end';
function getSaleEnd() {
  const stored = localStorage.getItem(SALE_END_KEY);
  if (stored && Number(stored) > Date.now()) return Number(stored);
  const end = Date.now() + 12 * 60 * 60 * 1000;
  localStorage.setItem(SALE_END_KEY, String(end));
  return end;
}
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Smartphones', icon: '📱', color: 'from-blue-500 to-cyan-400' },
  { name: 'Laptops', icon: '💻', color: 'from-purple-500 to-pink-500' },
  { name: 'Fragrances', icon: '✨', color: 'from-amber-500 to-orange-400' },
  { name: 'Skin Care', icon: '🧴', color: 'from-emerald-400 to-teal-500' },
  { name: 'Groceries', icon: '🛒', color: 'from-red-400 to-rose-500' },
  { name: 'Home Decoration', icon: '🏠', color: 'from-indigo-500 to-blue-600' },
];

const FEATURES = [
  { icon: <Truck className="w-6 h-6" />, title: 'Free Shipping', desc: 'On orders over ₹500' },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Secure Payment', desc: '100% safe & secure' },
  { icon: <Clock className="w-6 h-6" />, title: '24/7 Support', desc: 'Dedicated support' },
  { icon: <Zap className="w-6 h-6" />, title: 'Fast Delivery', desc: 'Across India' },
];

const Home = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector(state => state.products);
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, featured: true }));
  }, [dispatch]);

  useEffect(() => {
    const saleEnd = getSaleEnd();
    const tick = () => {
      const diff = saleEnd - Date.now();
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const h = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const flashSaleProducts = products.filter(p => p.isFlashSale).slice(0, 4);
  const trendingProducts = products.slice(0, 8);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[600px] flex items-center">
        <div className="absolute inset-0 bg-hero-gradient z-0"></div>
        <div className="absolute inset-0 bg-mesh opacity-50 z-0"></div>
        
        {/* Abstract shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-600/20 rounded-full blur-[80px] z-0"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px] z-0"></div>

        <div className="page-container relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge-primary mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-sm">
                <Zap className="w-4 h-4" /> Tech & Lifestyle
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight mb-6 text-white text-balance">
                Elevate Your <br />
                <span className="gradient-text">Digital Life</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl">
                Discover the latest premium products with next-day delivery. Experience shopping like never before.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary text-lg px-8 flex items-center gap-2">
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/products?category=smartphones" className="btn-secondary text-lg px-8">
                  Explore Phones
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero image placeholder - would be an actual image in production */}
        <motion.div 
          className="absolute right-10 md:right-32 top-1/2 -translate-y-1/2 hidden lg:block z-10"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-[500px] h-[500px] relative">
             <div className="absolute inset-0 border-[40px] border-white/5 rounded-full blur-sm"></div>
             <div className="absolute inset-10 border-[20px] border-primary-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
             <img src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80" alt="Hero" className="absolute inset-0 w-full h-full object-cover rounded-full mix-blend-overlay opacity-80 shadow-glow-lg" />
          </div>
        </motion.div>
      </section>

      {/* Features bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0 border border-primary-500/20">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 page-container">
        <div className="flex items-center justify-between mb-10">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link 
              key={idx} 
              to={`/products?category=${cat.name.toLowerCase()}`}
              className="glass-card p-6 flex flex-col items-center justify-center gap-4 text-center group hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-20 bg-dark-850 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/5 to-transparent z-0"></div>
        <div className="page-container relative z-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge-danger px-3 py-1 text-sm animate-pulse">Live Now</span>
                <span className="text-gray-400 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Ends in{' '}
                  <span className="font-mono text-white tabular-nums">{timeLeft}</span>
                </span>
              </div>
              <h2 className="section-title flex items-center gap-3">
                Flash Deals <Zap className="w-8 h-8 text-accent-500 fill-accent-500" />
              </h2>
            </div>
            <Link to="/products?flashSale=true" className="btn-secondary hidden sm:flex">
              View All Deals
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-96 skeleton"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 page-container">
        <div className="flex items-center justify-between mb-10">
          <h2 className="section-title flex items-center gap-3">
            Trending Now <TrendingUp className="w-8 h-8 text-primary-500" />
          </h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
            {[...Array(8)].map((_, i) => <div key={i} className="h-96 skeleton"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
            {trendingProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
