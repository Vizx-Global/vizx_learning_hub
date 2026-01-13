import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../utils/axiosClient';
import { useAuth } from '../../../contexts/AuthContext';
import Swal from 'sweetalert2';

const UserActionsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  mode = 'edit',
  onUserUpdated,
  onUserDeleted 
}) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    jobTitle: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        jobTitle: user.jobTitle || '',
        role: user.role || 'EMPLOYEE',
        status: user.status || 'ACTIVE'
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSuccessAlert = (title, message) => {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true
    });
  };

  const showErrorAlert = (title, message) => {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'OK'
    });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosClient.put(`/users/${user.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        department: formData.department,
        jobTitle: formData.jobTitle,
        role: formData.role
      });

      if (response.data.success) {
        await showSuccessAlert('Success!', 'User updated successfully.');
        onUserUpdated(response.data.data.user);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      await showErrorAlert('Update Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Show confirmation dialog first
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-left">
          <p>You are about to delete <strong>${user.firstName} ${user.lastName}</strong>.</p>
          <p class="mt-2 text-sm text-gray-600">This action will permanently remove:</p>
          <ul class="text-sm text-gray-600 mt-1 space-y-1">
            <li>• User profile and account information</li>
            <li>• Learning progress and achievements</li>
            <li>• Points and gamification data</li>
            <li>• All associated records and history</li>
          </ul>
          <p class="mt-3 text-red-600 font-medium">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-4 py-2',
        cancelButton: 'px-4 py-2'
      }
    });

    if (!result.isConfirmed) {
      return; // User cancelled the deletion
    }

    setLoading(true);
    try {
      // Check if trying to delete own account
      if (user.id === currentUser?.id) {
        throw new Error('You cannot delete your own account');
      }

      console.log('Sending delete request for user:', user.id);
      const response = await axiosClient.delete(`/users/${user.id}`);
      console.log('Delete response:', response);
      
      // Flexible success checking for different backend response formats
      const isSuccess = response.data?.success || 
                       response.status === 200 || 
                       response.status === 204 ||
                       (response.data?.message && response.data.message.toLowerCase().includes('success')) ||
                       (response.data && Object.keys(response.data).length === 0); // Empty response can indicate success

      if (isSuccess) {
        console.log('Delete successful, closing modal and updating parent');
        
        await Swal.fire({
          title: 'Deleted!',
          text: `${user.firstName} ${user.lastName} has been deleted successfully.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        });

        // Call the deletion callback and close modal
        onUserDeleted(user.id);
        onClose();
      } else {
        // If we get here, the response wasn't as expected
        throw new Error(response.data?.message || 'Delete operation failed without specific error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      console.error('Error response:', error.response);

      let errorTitle = 'Delete Failed';
      let errorMessage = 'Failed to delete user. Please try again.';
      
      if (error.message === 'You cannot delete your own account') {
        errorTitle = 'Action Not Allowed';
        errorMessage = 'You cannot delete your own account. Please ask another admin to perform this action.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Cannot delete user. User may have dependencies or invalid data.';
      } else if (error.response?.status === 403) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to delete users.';
      } else if (error.response?.status === 404) {
        errorTitle = 'User Not Found';
        errorMessage = 'User not found. It may have already been deleted.';
      } else if (error.response?.status === 409) {
        errorTitle = 'Conflict';
        errorMessage = error.response?.data?.message || 'Cannot delete user due to existing dependencies.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      await Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const statusMessages = {
      'ACTIVE': 'activate',
      'INACTIVE': 'deactivate',
      'SUSPENDED': 'suspend'
    };

    const result = await Swal.fire({
      title: `Confirm ${statusMessages[newStatus]}?`,
      text: `Are you sure you want to ${statusMessages[newStatus]} ${user.firstName} ${user.lastName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${statusMessages[newStatus]}!`,
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.put(`/users/${user.id}`, {
        status: newStatus
      });

      if (response.data.success) {
        await showSuccessAlert(
          'Status Updated!', 
          `${user.firstName} ${user.lastName} has been ${statusMessages[newStatus]}d successfully.`
        );
        onUserUpdated(response.data.data.user);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user status';
      await showErrorAlert('Status Update Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Prevent modal from rendering if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border border-border max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'edit' ? 'Edit User' : 'Delete User'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'edit' 
                ? 'Update user information and settings' 
                : 'Permanently remove user from the system'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'edit' ? (
            <>
              {/* User Avatar & Basic Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground capitalize">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground font-mono">{user?.employeeId}</p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={errors.firstName ? 'border-destructive' : ''}
                      disabled={loading}
                    />
                    {errors.firstName && (
                      <p className="text-destructive text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={errors.lastName ? 'border-destructive' : ''}
                      disabled={loading}
                    />
                    {errors.lastName && (
                      <p className="text-destructive text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-destructive' : ''}
                    disabled
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department *
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Enter department"
                      className={errors.department ? 'border-destructive' : ''}
                      disabled={loading}
                    />
                    {errors.department && (
                      <p className="text-destructive text-xs mt-1">{errors.department}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Job Title *
                    </label>
                    <Input
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      placeholder="Enter job title"
                      className={errors.jobTitle ? 'border-destructive' : ''}
                      disabled={loading}
                    />
                    {errors.jobTitle && (
                      <p className="text-destructive text-xs mt-1">{errors.jobTitle}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    disabled={loading}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Quick Status Actions */}
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Quick Status Actions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user?.status !== 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange('ACTIVE')}
                        disabled={loading}
                        className="text-success border-success/20 hover:bg-success/10"
                      >
                        <Icon name="CheckCircle" size={14} className="mr-1" />
                        Activate
                      </Button>
                    )}
                    {user?.status !== 'INACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange('INACTIVE')}
                        disabled={loading}
                        className="text-muted-foreground border-muted/20 hover:bg-muted/10"
                      >
                        <Icon name="PauseCircle" size={14} className="mr-1" />
                        Deactivate
                      </Button>
                    )}
                    {user?.status !== 'SUSPENDED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange('SUSPENDED')}
                        disabled={loading}
                        className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <Icon name="Ban" size={14} className="mr-1" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{errors.submit}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Delete Confirmation - Simplified since we use SweetAlert2 */
            <div className="text-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="AlertTriangle" size={32} className="text-destructive" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to Delete?
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Click the button below to proceed with deleting <strong>{user?.firstName} {user?.lastName}</strong>.
                You'll get a final confirmation before the user is permanently removed.
              </p>

              <div className="flex items-center gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Icon name="Loader" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Trash2" size={16} />
                  )}
                  Proceed to Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - For Edit Mode */}
        {mode === 'edit' && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Icon name="Loader" size={16} className="animate-spin" />
              ) : (
                <Icon name="Save" size={16} />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActionsModal;