import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(formData)).unwrap();
      navigate('/');
    } catch (error) {
      // Error handled by Redux thunk (toast)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 relative z-10">
        
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow mb-4">
            <span className="text-white text-2xl font-display font-bold">W</span>
          </Link>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to continue to Wistoria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="you@example.com"
              />
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <Link to="#" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="••••••••"
              />
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-8"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
