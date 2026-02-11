import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { departmentService } from '../../../api';
import DepartmentModal from './components/DepartmentModal';
import toast from 'react-hot-toast';

const DepartmentManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAllDepartments({ page: 1, limit: 100 });
      setDepartments(response.data.data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSave = async (data) => {
    try {
      setModalLoading(true);
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, data);
        toast.success('Department updated successfully');
      } else {
        await departmentService.createDepartment(data);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      console.error('Failed to save department:', error);
      toast.error(editingDepartment ? 'Failed to update department' : 'Failed to create department');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentService.deleteDepartment(id);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to delete department');
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
              <p className="text-muted-foreground mt-1">Manage organizational structure and departments</p>
            </div>
            <Button 
              variant="default" 
              iconName="Plus" 
              onClick={() => {
                setEditingDepartment(null);
                setIsModalOpen(true);
              }}
            >
              Add Department
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Icon name="Loader" className="animate-spin text-primary" size={32} />
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Building" className="text-muted-foreground" size={24} />
              </div>
              <h3 className="text-lg font-medium text-foreground">No departments found</h3>
              <p className="text-muted-foreground mt-1">Get started by creating a new department.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDepartments.map((dept) => (
                <div key={dept.id} className="bg-card rounded-xl border border-border hover:shadow-lg transition-all p-5 flex flex-col group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Icon name="Building" className="text-primary" size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingDepartment(dept);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">{dept.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                    {dept.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Icon name="Users" size={14} />
                      <span>{dept._count?.users || 0} Members</span>
                    </div>
                    {/* Add more stats here later if needed */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        department={editingDepartment}
        loading={modalLoading}
      />
    </div>
  );
};

export default DepartmentManagement;
