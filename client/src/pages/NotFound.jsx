import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center page-container relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-[100px] -z-10" />

      <div className="text-center max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Giant 404 */}
          <div className="relative mb-8 inline-block select-none">
            <span className="text-[160px] md:text-[220px] font-display font-extrabold leading-none bg-gradient-to-b from-white/10 to-white/[0.02] bg-clip-text text-transparent">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 md:w-24 md:h-24 text-primary-500/40" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary flex items-center gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
              <Link to="/" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
