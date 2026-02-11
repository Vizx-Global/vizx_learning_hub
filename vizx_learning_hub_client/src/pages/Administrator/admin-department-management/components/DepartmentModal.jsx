import React, { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Icon from '../../../../components/AppIcon';
import TextArea from '../../../../components/ui/TextArea';

const DepartmentModal = ({ isOpen, onClose, onSave, department = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '' // Future proofing for manager assignment
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        managerId: department.managerId || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        managerId: ''
      });
    }
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">{department ? 'Edit Department' : 'Create Department'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Department Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Engineering"
            required
          />
          
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the department..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="default" type="submit" loading={loading}>
              {department ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;
