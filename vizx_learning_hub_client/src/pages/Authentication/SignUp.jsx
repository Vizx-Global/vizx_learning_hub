import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import Image from '../../components/AppImage';
import LiveUpdateIndicator from '../../components/ui/LiveUpdateIndicator';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    phone: '',
    department: '',
    jobTitle: '',
    agreeToTerms: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    else if (formData.firstName.trim().length < 2) newErrors.firstName = 'First name must be at least 2 characters';

    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (formData.lastName.trim().length < 2) newErrors.lastName = 'Last name must be at least 2 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare data for API call
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        employeeId: formData.employeeId.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        department: formData.department.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined,
      };

      const result = await register(registrationData);
      
      if (result.success) {
        // Success - redirect to dashboard
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Welcome to AI Learning Hub! Your account has been created successfully.',
            type: 'success'
          }
        });
      } else {
        // Handle API errors
        if (result.error.includes('email') || result.error.includes('Email')) {
          setErrors({ email: result.error });
        } else if (result.error.includes('Employee ID')) {
          setErrors({ employeeId: result.error });
        } else {
          setErrors({ submit: result.error });
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-theme">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
        {/* Left Side - Visuals */}
        <div 
          className="hidden lg:flex bg-cover bg-center bg-no-repeat p-12 flex-col justify-between relative overflow-hidden"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767744275/20240926_220838_orbc6j.jpg)' }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/10">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Join 50+ Professionals</span>
            </div>

            <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
              Start Your learning Journey
            </h3>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="flex items-center gap-4 p-4 ">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Personalized Mentor</p>
                  <p className="text-white/80 text-sm">Adaptive learning paths</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Enterprise Ready</p>
                  <p className="text-white/80 text-sm">Microsoft Learn integration</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Gamified Progress</p>
                  <p className="text-white/80 text-sm">Earn badges & leaderboards</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Community Driven</p>
                  <p className="text-white/80 text-sm">Connect with peers & mentors</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Certified Skills</p>
                  <p className="text-white/80 text-sm">Industry-standard recognition</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-6 lg:p-10">
          <div className="max-w-md mx-auto">
             {/* Unified Header */}
             <div className="text-center lg:text-left mb-6">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <Link to="/" className="flex-shrink-0">
                  <Image 
                    src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" 
                    alt="AI Learning Hub"
                    className="h-20 w-auto rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    fallback={<div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg"></div>}
                  />
                </Link>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Create Account
              </h2>
              <p className="text-muted-foreground">
                Start your AI learning journey today
              </p>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="h-3 w-3 text-error" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-error text-sm font-medium">{errors.submit}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <LiveUpdateIndicator 
                isUpdating={isLoading} 
                message="Creating your account..." 
              />

              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={errors.firstName}
                  placeholder="Enter your first name"
                  required
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={errors.lastName}
                  placeholder="Enter your last name"
                  required
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
              </div>

              {/* Email */}
              <Input
                label="Work Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="your.name@company.com"
                required
                disabled={isLoading}
                className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
              />

              {/* Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
                  placeholder="Create a strong password"
                  required
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
              </div>

              {/* Professional Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Employee ID"
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  error={errors.employeeId}
                  placeholder="EMP-001"
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Engineering, Marketing, etc."
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
                <Input
                  label="Job Title"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  placeholder="Software Engineer, Manager, etc."
                  disabled={isLoading}
                  className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3 bg-muted/50 p-3 rounded-xl border border-border">
                <Checkbox
                  label={
                    <span className="text-foreground">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary font-semibold hover:underline transition-colors">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-primary font-semibold hover:underline transition-colors">
                        Privacy Policy
                      </a>
                    </span>
                  }
                  checked={formData.agreeToTerms}
                  onChange={(checked) => handleChange('agreeToTerms', checked)}
                  error={errors.agreeToTerms}
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-4 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
                disabled={isLoading || !formData.agreeToTerms}
                loading={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-primary font-semibold hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;