import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth success
    navigate('/');
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

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe" required />
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com" required />
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" required />
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
              className="text-primary hover-underline font-medium"
              onClick={() => setIsLogin(!isLogin)}
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
