import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import axiosClient from '../../../../utils/axiosClient';
import departmentService from '../../../../api/departmentService';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    phone: '',
    department: '',
    jobTitle: '',
    role: 'EMPLOYEE',
    password: '',
    confirmPassword: '',
    sendWelcomeEmail: true,
    requirePasswordChange: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const roles = [
    { value: 'EMPLOYEE', label: 'Employee', description: 'Basic access to learning content' },
    { value: 'MANAGER', label: 'Manager', description: 'Manage team and view team analytics' },
    { value: 'ADMIN', label: 'Administrator', description: 'Full system access and configuration' }
  ];

  const defaultJobTitles = [
    'BPO Associate',
    'Head of Research & Development',
    'HR Manager',
    'Web Developer',
    'Executive Assistant',
    'Real Estate Specialist',
    'Communication and Lead Sourcing Specialist',
    'Head of Operations',
    'Office Assistant',
    'Recruiter',
    'BPO Executive',
    'Sales Executive',
    'Marketing Manager',
    'Content Strategist',
    'SEO Specialist',
    'Digital Marketing Specialist',
    'Sales Representative',
    'Account Executive',
    'Sales Manager',
    'Business Development Manager',
    'HR Manager',
    'Recruiter',
    'HR Business Partner',
    'Talent Acquisition Specialist',
    'Financial Analyst',
    'Accountant',
    'Finance Manager',
    'Controller',
    'Operations Manager',
    'Project Manager',
    'Operations Specialist',
    'IT Support',
    'System Administrator',
    'Network Engineer',
    'IT Manager',
    'Customer Success Manager',
    'Support Specialist',
    'Account Manager',
    'UI/UX Designer',
    'Graphic Designer',
    'Design Manager'
  ];

  // Helper function to identify common job titles that should always be available
  const isCommonJobTitle = (title) => {
    const commonTitles = ['Manager', 'Specialist', 'Engineer', 'Analyst', 'Coordinator', 'Director', 'Lead'];
    return commonTitles.some(common => title.toLowerCase().includes(common.toLowerCase()));
  };

  // Filter job titles based on selected department
  const filteredJobTitles = formData.department
    ? jobTitles.filter(title =>
      title.toLowerCase().includes(formData.department.toLowerCase()) ||
      isCommonJobTitle(title)
    )
    : jobTitles;

  // Initialize departments and job titles when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeDepartmentsAndJobTitles();
    }
  }, [isOpen]);

  const initializeDepartmentsAndJobTitles = async () => {
    setLoadingData(true);

    try {
      // Fetch departments from API
      try {
        const response = await departmentService.getAllDepartments({ limit: 100 });
        if (response.data?.success) {
          const apiDepartments = response.data.data.departments || [];
          const deptNames = apiDepartments.map(d => d.name).sort();
          setDepartments(deptNames);
        }
      } catch (err) {
        console.error('Failed to fetch departments from service:', err);
        // Fallback to defaults or user extraction if service fails
        setDepartments(defaultDepartments);
      }

      // Fetch existing users to extract unique job titles
      try {
        const usersResponse = await axiosClient.get('/users/all');
        console.log('Users response for data extraction:', usersResponse.data);

        if (usersResponse.data?.data) {
          const users = Array.isArray(usersResponse.data.data)
            ? usersResponse.data.data
            : usersResponse.data.data.users || [];

          // Extract unique job titles from existing users
          const userJobTitles = [...new Set(users
            .map(user => user.jobTitle)
            .filter(title => title && title.trim())
          )].sort();

          // Combine with defaults
          const combinedJobTitles = [...userJobTitles, ...defaultJobTitles]
            .filter((title, index, array) => array.indexOf(title) === index)
            .sort();

          setJobTitles(combinedJobTitles);
        } else {
          setJobTitles(defaultJobTitles);
        }
      } catch (userError) {
        console.log('Could not fetch users for job titles, using defaults:', userError);
        setJobTitles(defaultJobTitles);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      if (departments.length === 0) setDepartments(defaultDepartments);
      setJobTitles(defaultJobTitles);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // If department changes, reset job title
    if (field === 'department') {
      setFormData(prev => ({ ...prev, jobTitle: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.jobTitle) {
      newErrors.jobTitle = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const generateEmployeeId = () => {
    return `EMP${Date.now().toString().slice(-6)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called');

    if (!validateStep2()) {
      console.log('Validation failed', errors);
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting form data', formData);

    try {
      // Prepare the request body according to your API specification
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        employeeId: formData.employeeId || generateEmployeeId(),
        phone: formData.phone || undefined,
        department: formData.department,
        jobTitle: formData.jobTitle,
        role: formData.role
      };

      console.log('Creating user with data:', userData);

      // Use the correct endpoint for user creation
      const response = await axiosClient.post('/auth/users', userData);

      console.log('User creation response:', response.data);

      if (response.data.success || response.status === 201) {
        // Call success callback with new user data
        if (onSuccess) {
          onSuccess(response.data.data?.user || userData);
        }

        // Show success message
        console.log('User created successfully');

        // Reset form and close modal
        handleClose();
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error response:', error.response);

      let errorMessage = 'Failed to create user. Please try again.';

      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid user data. Please check the form.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response?.data?.message || 'User with this email already exists.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      phone: '',
      department: '',
      jobTitle: '',
      role: 'EMPLOYEE',
      password: '',
      confirmPassword: '',
      sendWelcomeEmail: true,
      requirePasswordChange: true
    });
    setErrors({});
    setStep(1);
    onClose();
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    handleInputChange('password', password);
    handleInputChange('confirmPassword', password);
  };

  const generateEmployeeIdInput = () => {
    const newEmployeeId = generateEmployeeId();
    handleInputChange('employeeId', newEmployeeId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="UserPlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create New User</h2>
              <p className="text-sm text-muted-foreground">
                Step {step} of 2: {step === 1 ? 'Basic Information' : 'Security Settings'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
            disabled={isSubmitting}
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'
              }`} />
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'
              }`} />
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mx-6 mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <Icon name="AlertCircle" size={16} />
              <span className="text-sm">{errors.submit}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${errors.firstName ? 'border-destructive' : 'border-border'
                      }`}
                    placeholder="John"
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${errors.lastName ? 'border-destructive' : 'border-border'
                      }`}
                    placeholder="Doe"
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${errors.email ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="john.doe@company.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <Icon name="AlertCircle" size={12} />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Employee ID and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Employee ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      placeholder="EMP001"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={generateEmployeeIdInput}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-accent transition-colors"
                      disabled={isSubmitting}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="+1234567890"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Department and Job Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Department <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${errors.department ? 'border-destructive' : 'border-border'
                      }`}
                    disabled={isSubmitting || loadingData}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Title <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${errors.jobTitle ? 'border-destructive' : 'border-border'
                      }`}
                    disabled={isSubmitting || loadingData || !formData.department}
                  >
                    <option value="">Select job title</option>
                    {filteredJobTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                  {errors.jobTitle && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      {errors.jobTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  User Role <span className="text-destructive">*</span>
                </label>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleInputChange('role', role.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${formData.role === role.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${formData.role === role.value
                              ? 'border-primary bg-primary'
                              : 'border-border'
                            }`}>
                            {formData.role === role.value && (
                              <Icon name="Check" size={12} className="text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground mb-1">{role.label}</div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                        <Icon
                          name={
                            role.value === 'ADMIN' ? 'Key' :
                              role.value === 'MANAGER' ? 'Users' :
                                'User'
                          }
                          size={20}
                          className={formData.role === role.value ? 'text-primary' : 'text-muted-foreground'}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State for Data */}
              {loadingData && (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Icon name="Loader" size={16} className="animate-spin" />
                  <span>Loading departments and job titles...</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Security Settings */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-2 pr-24 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${errors.password ? 'border-destructive' : 'border-border'
                      }`}
                    placeholder="Enter password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    disabled={isSubmitting}
                  >
                    Generate
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <Icon name="AlertCircle" size={12} />
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${errors.confirmPassword ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="Confirm password"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <Icon name="AlertCircle" size={12} />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="p-4 bg-accent/30 rounded-lg">
                  <div className="text-sm font-medium text-foreground mb-2">Password Strength</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength =
                        formData.password.length >= 12 ? 4 :
                          formData.password.length >= 10 ? 3 :
                            formData.password.length >= 8 ? 2 : 1;

                      return (
                        <div
                          key={level}
                          className={`flex-1 h-2 rounded-full transition-colors ${level <= strength
                              ? strength >= 4 ? 'bg-success' :
                                strength >= 3 ? 'bg-primary' :
                                  strength >= 2 ? 'bg-warning' :
                                    'bg-destructive'
                              : 'bg-muted'
                            }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Send Welcome Email</div>
                    <div className="text-sm text-muted-foreground">
                      Send login credentials and welcome message
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('sendWelcomeEmail', !formData.sendWelcomeEmail)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.sendWelcomeEmail ? 'bg-success' : 'bg-muted'
                      }`}
                    disabled={isSubmitting}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${formData.sendWelcomeEmail ? 'left-6' : 'left-0.5'
                      }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Require Password Change</div>
                    <div className="text-sm text-muted-foreground">
                      User must change password on first login
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('requirePasswordChange', !formData.requirePasswordChange)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.requirePasswordChange ? 'bg-success' : 'bg-muted'
                      }`}
                    disabled={isSubmitting}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${formData.requirePasswordChange ? 'left-6' : 'left-0.5'
                      }`} />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground mb-2">User Summary</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>• Name: {formData.firstName} {formData.lastName}</div>
                      <div>• Email: {formData.email}</div>
                      <div>• Employee ID: {formData.employeeId || 'Auto-generated'}</div>
                      <div>• Role: {roles.find(r => r.value === formData.role)?.label}</div>
                      <div>• Department: {formData.department}</div>
                      <div>• Job Title: {formData.jobTitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-card border-t border-border p-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? handleClose : handleBack}
              disabled={isSubmitting}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex items-center gap-3">
              {step === 1 ? (
                <Button
                  type="button"
                  variant="default"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={handleNext}
                  disabled={isSubmitting || loadingData}
                >
                  {loadingData ? 'Loading...' : 'Next'}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="default"
                  iconName="Check"
                  iconPosition="left"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating User...' : 'Create User'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;