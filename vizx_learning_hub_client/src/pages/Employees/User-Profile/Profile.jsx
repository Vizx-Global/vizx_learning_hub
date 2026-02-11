import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { User, Lock, Mail, Phone, Briefcase, FileText, CheckCircle, AlertCircle, Camera, Upload } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeProfile() {
  const { user, updateProfile, changePassword, uploadUserAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: ''
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Updating profile...');

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!', { id: toastId });
      } else {
        toast.error(result.error || 'Failed to update profile', { id: toastId });
      }
    } catch (error) {
      toast.error('An unexpected error occurred', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setPasswordLoading(true);
    const toastId = toast.loading('Updating password...');

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        toast.success('Password changed successfully!', { id: toastId });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.error || 'Failed to change password', { id: toastId });
      }
    } catch (error) {
      toast.error('An unexpected error occurred', { id: toastId });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
    }

    const toastId = toast.loading('Uploading avatar...');
    try {
      const result = await uploadUserAvatar(file);
      if (result.success) {
        toast.success('Avatar updated successfully!', { id: toastId });
      } else {
        toast.error(result.error || 'Failed to upload avatar', { id: toastId });
      }
    } catch (error) {
       toast.error('An unexpected error occurred', { id: toastId });
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName ? user.firstName[0].toUpperCase() : '';
    const last = user.lastName ? user.lastName[0].toUpperCase() : '';
    return first + last || user.email?.[0].toUpperCase() || 'U';
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Account Security', icon: Lock }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm text-center mb-6">
                <div className="relative inline-block group cursor-pointer" onClick={handleAvatarClick}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-3 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all relative">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{getInitials()}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white h-8 w-8" />
                        </div>
                    </div>
                    <div className="absolute bottom-3 right-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-transform">
                         <Upload size={12} />
                    </div>
                </div>
                <h3 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-muted-foreground">{user?.jobTitle || 'Team Member'}</p>
                <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:underline" onClick={handleAvatarClick}>Click image to change</p>
            </div>

            <nav className="space-y-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            activeTab === tab.id 
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>

        {/* Maing Content Area */}
        <div className="flex-1 w-full">
            <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                    <motion.div 
                        key="profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-border/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <User className="text-primary" size={24} />
                                Personal Information
                            </h2>
                            <p className="text-muted-foreground mt-1">Update your personal details and public profile.</p>
                        </div>
                        
                        <div className="p-8">
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input 
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                                className="pl-10 h-10 md:h-12 bg-secondary/20 border-border/50"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input 
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                                className="pl-10 h-10 md:h-12 bg-secondary/20 border-border/50"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input 
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                className="pl-10 h-10 md:h-12 bg-secondary/20 border-border/50"
                                                type="email"
                                                placeholder="Enter email address"
                                                disabled // Email usually shouldn't be changed easily or requires verification
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Contact admin to change email address.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <Input 
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                className="pl-10 h-10 md:h-12 bg-secondary/20 border-border/50"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Job Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input 
                                            value={profileData.jobTitle}
                                            onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                                            className="pl-10 h-10 md:h-12 bg-secondary/20 border-border/50"
                                            placeholder="e.g. Senior Software Engineer"
                                        />
                                    </div>
                                </div>



                                <div className="flex justify-end pt-4 border-t border-border/50">
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                                    >
                                        {isLoading ? 'Saving Changes...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'security' && (
                    <motion.div 
                        key="security"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-border/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Lock className="text-orange-500" size={24} />
                                Account Security
                            </h2>
                            <p className="text-muted-foreground mt-1">Manage your password and security settings.</p>
                        </div>
                        
                        <div className="p-8">
                            <form onSubmit={handlePasswordChange} className="max-w-xl space-y-6">
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl mb-6">
                                    <div className="flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300">Password Requirements</h4>
                                            <ul className="mt-1 text-xs text-orange-700 dark:text-orange-400 list-disc ml-4 space-y-0.5">
                                                <li>At least 8 characters long</li>
                                                <li>Include at least one number</li>
                                                <li>Include at least one special character</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Current Password</label>
                                    <Input 
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="h-10 md:h-12 bg-secondary/20 border-border/50"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                     <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">New Password</label>
                                        <Input 
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            className="h-10 md:h-12 bg-secondary/20 border-border/50"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                                        <Input 
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className="h-10 md:h-12 bg-secondary/20 border-border/50"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-border/50">
                                    <Button 
                                        type="submit" 
                                        disabled={passwordLoading}
                                        className="h-11 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all border-0"
                                    >
                                        {passwordLoading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
