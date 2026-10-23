// src/pages/auth/RegisterPage.jsx - Using CSS
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Home, Building, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import '../../css/pages/register.css';
import '../../css/global.css';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  role: z.enum(['buyer', 'seller', 'agent']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'buyer',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    const container = document.querySelector('.register-page');
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
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);
      if (result.success) {
        toast.success('Account created successfully! 🎉', {
          style: {
            background: '#d4af37',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
          },
        });
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'buyer', label: 'Buyer', icon: Home, description: 'Find your dream property' },
    { value: 'seller', label: 'Seller', icon: Building, description: 'List your property' },
    { value: 'agent', label: 'Agent', icon: Briefcase, description: 'Professional real estate' },
  ];

  return (
    <div className="register-page">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="register-card">
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>

        <div className="text-center">
          <div className="badge">Get Started</div>
          <h1 className="brand-title">Create Account</h1>
          <p className="brand-subtitle">Join the premium real estate community</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <div className="input-wrapper">
                <User className="icon" />
                <input
                  {...register('firstName')}
                  type="text"
                  className={errors.firstName ? 'error' : ''}
                  placeholder="John"
                />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName.message}</span>}
            </div>

            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <div className="input-wrapper">
                <User className="icon" />
                <input
                  {...register('lastName')}
                  type="text"
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address <span className="required">*</span></label>
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

          <div className="form-row">
            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <div className="input-wrapper">
                <Lock className="icon" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={errors.password ? 'error' : ''}
                  placeholder="Min 6 chars"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label>Confirm <span className="required">*</span></label>
              <div className="input-wrapper">
                <Lock className="icon" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <div className="form-group role-group">
            <label>I am a <span className="required">*</span></label>
            <div className="role-grid">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <label
                    key={role.value}
                    className={`role-card ${isSelected ? 'selected' : ''}`}
                  >
                    <input type="radio" {...register('role')} value={role.value} />
                    <Icon className="role-icon" />
                    <div className="role-label">{role.label}</div>
                    <div className="role-desc">{role.description}</div>
                    <div className="role-check">
                      <CheckCircle />
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.role && <span className="error-message">{errors.role.message}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">Already have an account?</span>
        </div>

        <div className="text-center">
          <Link to="/login" className="footer-link">
            Sign in instead
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default RegisterPage;