// src/pages/auth/LoginPage.jsx - Using CSS
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import '../../css/pages/login.css';
import '../../css/global.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const container = document.querySelector('.login-page');
    if (container) {
      for (let i = 0; i < 25; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 5 + 's';
        sparkle.style.animationDuration = (2 + Math.random() * 3) + 's';
        sparkle.style.width = (2 + Math.random() * 4) + 'px';
        sparkle.style.height = sparkle.style.width;
        container.appendChild(sparkle);
      }
    }
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Welcome back! 🎉', {
          style: {
            background: '#d4af37',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
          },
        });
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Invalid email or password');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="login-card">
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>

       <div className="brand-section">
  <div className="badge">Secure Access</div>
  <h1 className="brand-title">Welcome Back</h1>
  <p className="brand-subtitle">Sign in to your account to continue</p>
  <div style={{ height: '8px' }}></div> {/* Added spacer */}
</div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>
              Email Address <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Mail className="icon" />
              <input
                {...register('email')}
                type="email"
                className={errors.email ? 'error' : ''}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>
              Password <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Lock className="icon" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <div className="options-row">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">New to RealEstate AI?</span>
        </div>

        <div className="text-center">
          <Link to="/register" className="footer-link">
            Create an account
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      <p className="footer-text">© 2026 RealEstate AI. All rights reserved.</p>
    </div>
  );
};

export default LoginPage;