import { Link } from 'react-router-dom';
import { Camera, Mail, MapPin, MessageCircle, Phone, PlayCircle, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-950 border-t border-white/5 pt-16 pb-8 mt-20 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-3xl font-display font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                <span className="text-white text-2xl">W</span>
              </div>
              <span className="gradient-text">Wistoria</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your premium destination for the best products. Quality, affordability, and fast delivery guaranteed.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="btn-icon"><MessageCircle className="w-5 h-5" /></a>
              <a href="#" className="btn-icon"><Send className="w-5 h-5" /></a>
              <a href="#" className="btn-icon"><Camera className="w-5 h-5" /></a>
              <a href="#" className="btn-icon"><PlayCircle className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/products" className="nav-link">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="nav-link">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="nav-link">Fashion</Link></li>
              <li><Link to="/profile" className="nav-link">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Customer Service</h3>
            <ul className="space-y-3">
              <li><Link to="/orders" className="nav-link">Track Order</Link></li>
              <li><Link to="#" className="nav-link">Returns & Refunds</Link></li>
              <li><Link to="#" className="nav-link">Shipping Info</Link></li>
              <li><Link to="#" className="nav-link">FAQ</Link></li>
              <li><Link to="#" className="nav-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                <span>123 Commerce Avenue, Tech Park, Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span>support@wistoria.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Wistoria. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
