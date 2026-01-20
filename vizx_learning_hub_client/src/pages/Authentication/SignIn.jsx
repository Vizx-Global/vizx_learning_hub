import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import Image from '../../components/AppImage';
import LiveUpdateIndicator from '../../components/ui/LiveUpdateIndicator';
import { OrbitProgress } from 'react-loading-indicators';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const SignInForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessLoading, setShowSuccessLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (errors.submit) setErrors(prev => ({ ...prev, submit: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setShowSuccessLoading(true);
        const targetPath = result.user.role === 'EMPLOYEE' ? '/employee-dashboard' : '/admin-learning-dashboard';
        setTimeout(() => { navigate(targetPath, { replace: true, state: { message: 'Welcome back! You have successfully signed in.', type: 'success' } }); }, 1000);
      } else {
        if (result.error.toLowerCase().includes('email') || result.error.includes('user not found')) setErrors({ email: result.error });
        else if (result.error.toLowerCase().includes('password') || result.error.includes('invalid credentials')) setErrors({ password: result.error });
        else if (result.error.includes('inactive') || result.error.includes('suspended')) setErrors({ submit: 'Your account has been deactivated. Please contact support.' });
        else if (result.error.includes('verify') || result.error.includes('confirmation')) setErrors({ submit: 'Please verify your email address before signing in.' });
        else setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (showSuccessLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <OrbitProgress color="var(--color-primary)" size="medium" text="" textColor="" />
          <p className="text-foreground text-xl mt-6 font-semibold">Preparing your dashboard...</p>
          <p className="text-muted-foreground mt-2">Loading your personalized learning experience</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-theme">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        <div className="hidden lg:flex bg-cover bg-center bg-no-repeat p-12 flex-col justify-between relative overflow-hidden" style={{ backgroundImage: 'url(https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767740900/front_office_dwxpks.jpg)' }}>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/10">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live Learning Platform</span>
            </div>
            <h3 className="text-5xl font-bold text-white mb-6 leading-tight">Level Up Your Skills</h3>
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="flex items-center gap-4 p-4 ">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                <div className="text-left"><p className="text-white font-semibold">Track Progress</p><p className="text-white/80 text-sm">Monitor your learning journey</p></div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                <div className="text-left"><p className="text-white font-semibold">Compete Fairly</p><p className="text-white/80 text-sm">Engage in fair competitions</p></div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <div className="text-left"><p className="text-white font-semibold">Gamified Learning</p><p className="text-white/80 text-sm">Earn points and achievements</p></div>
              </div>
            </div>
          </div>
          <div className="relative z-10"><div className="flex justify-center space-x-6 text-white/80"><div className="text-center"><div className="text-2xl font-bold text-white">50+</div><div className="text-sm text-white/70">Active Learners</div></div><div className="text-center"><div className="text-2xl font-bold text-white">100+</div><div className="text-sm text-white/70">Learning Paths</div></div><div className="text-center"><div className="text-2xl font-bold text-white">95%</div><div className="text-sm text-white/70">Completion Rate</div></div></div></div>
        </div>
        <div className="p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <Link to="/" className="flex-shrink-0"><Image src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" alt="AI Learning Hub" className="h-24 w-full rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity" fallback={<div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg"></div>} /></Link>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Welcome Back</h2>
              <p className="text-muted-foreground text-lg">Sign in to continue your learning journey</p>
            </div>
            {errors.submit && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0"><svg className="h-3 w-3 text-error" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></div>
                  <p className="text-error text-sm font-medium">{errors.submit}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <LiveUpdateIndicator isUpdating={isLoading} message="Signing you in..." />
              <Input label="Email Address" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} placeholder="your.name@company.com" required disabled={isLoading} className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3" icon={<Mail className="w-5 h-5 text-muted-foreground" />} />
              <div className="relative">
                <Input label="Password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} error={errors.password} placeholder="Enter your password" required disabled={isLoading} className="bg-input border border-border focus:border-primary transition-colors rounded-xl px-4 py-3 pr-12" icon={<Lock className="w-5 h-5 text-muted-foreground" />} />
                <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-[38px] transform text-muted-foreground hover:text-foreground transition-colors" disabled={isLoading}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
              <div className="flex items-center justify-between"><Checkbox label="Remember me" checked={formData.rememberMe} onChange={(checked) => handleChange('rememberMe', checked)} disabled={isLoading} /><Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">Forgot password?</Link></div>
              <Button type="submit" className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={isLoading} loading={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</Button>
              <div className="text-center"><p className="text-muted-foreground">Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline transition-colors">Create one here</Link></p></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;