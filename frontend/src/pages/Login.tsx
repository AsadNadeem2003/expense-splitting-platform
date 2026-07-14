import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background Elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <motion.div 
        className="glass-panel login-box"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="login-header">
          <div className="logo-icon large">SE</div>
          <h1 className="logo-text text-gradient text-3xl mt-4">SplitEase</h1>
          <p className="text-secondary mt-2">
            {isLogin ? 'Welcome back! Sign in to your account.' : 'Create an account to start splitting.'}
          </p>
        </div>

        {error && <div className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4 text-sm text-center border border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin} 
              />
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4 py-3">
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer mt-6 text-center">
          <p className="text-sm text-secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              className="text-primary hover-underline font-medium"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
