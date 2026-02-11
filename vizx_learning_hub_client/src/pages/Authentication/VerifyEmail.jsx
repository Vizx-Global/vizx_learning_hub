import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { OrbitProgress } from 'react-loading-indicators';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowLeft, RefreshCw, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, user, resendVerificationEmail } = useAuth();
    
    // Get email from location state or auth context or query param
    const email = location.state?.email || user?.email;

    useEffect(() => {
        if (!email) {
            // If no email context, redirect to login or signup
            toast.error("No email found to verify. Please login or signup.");
            setTimeout(() => navigate('/login'), 2000);
        } else {
             // Optional: Auto-focus first input
             if (inputs.current[0]) inputs.current[0].focus();
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
        
        // If all fields are filled, trigger verification automatically
        const filledCode = newCode.join('');
        if (filledCode.length === 6 && newCode.every(digit => digit !== '')) {
            handleVerify(filledCode);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.every(char => !isNaN(char))) {
             const newCode = [...code];
             pastedData.forEach((digit, i) => {
                 if (i < 6) newCode[i] = digit;
             });
             setCode(newCode);
             if (newCode.every(d => d !== '')) {
                 handleVerify(newCode.join(''));
             }
        }
    };

    const handleVerify = async (verificationCode) => {
        if (isVerifying) return;
        setIsVerifying(true);
        const toastId = toast.loading('Verifying code...');
        
        try {
            const result = await verifyEmail(user?.id || null, verificationCode);
            if (result.success) {
                toast.success('Email verified successfully!', { id: toastId });
                setTimeout(() => {
                    navigate('/login', { replace: true, state: { message: 'Email verified successfully! You can now login.', type: 'success' } });
                }, 1500);
            } else {
                toast.error(result.error || 'Verification failed. Please try again.', { id: toastId });
                // Reset code on failure? Optional.
                // setCode(['', '', '', '', '', '']);
                // inputs.current[0].focus();
            }
        } catch (err) {
            toast.error('An unexpected error occurred.', { id: toastId });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (isResending) return;
        setIsResending(true);
        const toastId = toast.loading('Sending verification email...');
        
        try {
            await resendVerificationEmail(email);
            toast.success('Verification code resent!', { id: toastId });
        } catch (error) {
            toast.error('Failed to resend code.', { id: toastId });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4 transition-colors duration-300">
            <Toaster 
                position="top-center" 
                reverseOrder={false}
                toastOptions={{
                    className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg',
                    style: {
                        borderRadius: '0.75rem',
                        padding: '1rem',
                    },
                }}
            />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-600" />
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="text-center mb-8 relative">
                     {/* Logo */}
                     <div className="flex justify-center mb-8">
                        <img 
                            src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" 
                            alt="Vizx Academy" 
                            className="h-10 hidden lg:block object-contain" 
                        />
                        <img 
                            src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1768516447/Untitled_design__4__1-removebg-preview_ivfmvy.png" 
                            alt="Vizx Academy" 
                            className="h-10 block lg:hidden object-contain" 
                        />
                     </div>

                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-500 mb-6">
                        <Mail size={32} className="animate-float" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verify Your Email</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-4">
                        We've sent a 6-digit verification code to <br/>
                        <span className="font-semibold text-gray-900 dark:text-gray-200 mt-1 block">{email}</span>
                    </p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-3 mb-8" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <motion.input
                            key={index}
                            ref={(el) => (inputs.current[index] = el)}
                            whileFocus={{ scale: 1.05, y: -2 }}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 focus:outline-none transition-all duration-200
                                ${digit ? 'border-orange-500 text-orange-600 dark:text-orange-500 shadow-sm shadow-orange-200 dark:shadow-none' : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'}
                                focus:border-orange-500
                            `}
                            disabled={isVerifying}
                        />
                    ))}
                </div>

                <div className="space-y-6">
                    <Button
                        className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5"
                        onClick={() => handleVerify(code.join(''))}
                        disabled={isVerifying || code.some(d => !d)}
                    >
                        {isVerifying ? (
                            <div className="flex items-center gap-2 justify-center">
                                <OrbitProgress color="#ffffff" size="small" variant="track-disc" style={{ fontSize: '10px' }} />
                                <span className="ml-2">Verifying...</span>
                            </div>
                        ) : 'Verify Email'}
                    </Button>
                    
                    <div className="flex items-center justify-between text-sm px-1">
                         <button 
                            onClick={() => navigate('/login')}
                            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium"
                        >
                            <ArrowLeft size={16} className="mr-1.5" /> Back to Login
                        </button>
                        
                        <button 
                            onClick={handleResend}
                            disabled={isResending}
                            className={`flex items-center text-orange-600 hover:text-orange-700 dark:text-orange-500 font-semibold transition-colors ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                           {isResending ? (
                               <>Sending...</>
                           ) : (
                               <>
                                 <RefreshCw size={16} className="mr-1.5" /> Resend Code
                               </>
                           )}
                        </button>
                    </div>
                </div>
            </motion.div>
            
             {/* Security Note */}
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5"
            >
                <CheckCircle size={14} className="text-green-500" /> 
                Secure Verification Powered by Vizx Academy
            </motion.p>
        </div>
    );
};

export default VerifyEmail;
