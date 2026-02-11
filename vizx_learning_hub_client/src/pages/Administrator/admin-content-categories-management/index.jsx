import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import categoryService from '../../../api/categoryService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', iconUrl: '' });
  const [subFormData, setSubFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      // response is already body because of categoryService implementation
      if (response && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response && response.data && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('CategoryManagement: fetch error', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await categoryService.updateCategory(editingItem.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category created successfully');
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await categoryService.updateSubCategory(editingItem.id, subFormData);
        toast.success('Sub-category updated successfully');
      } else {
        await categoryService.createSubCategory(currentCategory.id, subFormData);
        toast.success('Sub-category created successfully');
      }
      fetchCategories();
      closeSubModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will delete all sub-categories.')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleDeleteSubCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-category?')) {
      try {
        await categoryService.deleteSubCategory(id);
        toast.success('Sub-category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete sub-category');
      }
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingItem(category);
      setFormData({ name: category.name, description: category.description || '', iconUrl: category.iconUrl || '' });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', iconUrl: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const openSubModal = (category, subcategory = null) => {
    setCurrentCategory(category);
    if (subcategory) {
      setEditingItem(subcategory);
      setSubFormData({ name: subcategory.name, description: subcategory.description || '' });
    } else {
      setEditingItem(null);
      setSubFormData({ name: '', description: '' });
    }
    setIsSubModalOpen(true);
  };

  const closeSubModal = () => {
    setIsSubModalOpen(false);
    setEditingItem(null);
    setCurrentCategory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
              >
                <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Content Categories</h1>
                <p className="text-sm text-muted-foreground">System Organization & Taxonomy</p>
              </div>
            </div>
            <Button onClick={() => openModal()} className="flex items-center gap-2">
              <Icon name="Plus" size={18} />
              New Category
            </Button>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="p-6 border-b border-border bg-muted/5 group-hover:bg-muted/10 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {category.iconUrl ? (
                      <img src={category.iconUrl} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <Icon name="Folder" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{category.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(category)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground">
                    <Icon name="Edit2" size={16} />
                  </button>
                  <button onClick={() => handleDeleteCategory(category.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive">
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sub-Categories ({category.subcategories?.length || 0})</h4>
                <button
                  onClick={() => openSubModal(category)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Icon name="Plus" size={14} />
                  Add Sub
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.subcategories?.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 border border-border rounded-full hover:border-primary/50 transition-all group/sub"
                  >
                    <span className="text-sm font-medium text-foreground">{sub.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openSubModal(category, sub)} className="h-4 w-4 text-muted-foreground hover:text-primary">
                        <Icon name="Edit2" size={12} />
                      </button>
                      <button onClick={() => handleDeleteSubCategory(sub.id)} className="h-4 w-4 text-muted-foreground hover:text-destructive">
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!category.subcategories || category.subcategories.length === 0) && (
                  <p className="text-sm text-muted-foreground italic py-2">No sub-categories defined yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-3xl">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Tags" size={40} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No categories yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">Start by creating your first content category to organize your learning paths.</p>
          <Button onClick={() => openModal()} variant="outline" className="mt-6">
            Create First Category
          </Button>
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground">{editingItem ? 'Edit Category' : 'Create Category'}</h2>
                  <button onClick={closeModal} className="p-2 hover:bg-accent rounded-xl text-muted-foreground">
                    <Icon name="X" size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateCategory} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Category Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                      placeholder="e.g. Engineering, Product Design..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Icon URL (Optional)</label>
                    <input
                      type="text"
                      value={formData.iconUrl}
                      onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                      className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all resize-none"
                      placeholder="Describe this category..."
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={closeModal} className="flex-1 py-4 text-base font-bold rounded-2xl">Cancel</Button>
                    <Button type="submit" className="flex-1 py-4 text-base font-bold rounded-2xl shadow-lg shadow-primary/20">{editingItem ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sub-Category Modal */}
      <AnimatePresence>
        {isSubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSubModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{editingItem ? 'Edit Sub-Category' : 'Create Sub-Category'}</h2>
                    <p className="text-sm text-muted-foreground mt-1">For {currentCategory?.name}</p>
                  </div>
                  <button onClick={closeSubModal} className="p-2 hover:bg-accent rounded-xl text-muted-foreground">
                    <Icon name="X" size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateSubCategory} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Sub-Category Name</label>
                    <input
                      required
                      type="text"
                      value={subFormData.name}
                      onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                      placeholder="e.g. React, UI Design, Marketing Strategy..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={subFormData.description}
                      onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                      className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all resize-none"
                      placeholder="Describe this sub-category..."
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={closeSubModal} className="flex-1 py-4 text-base font-bold rounded-2xl">Cancel</Button>
                    <Button type="submit" className="flex-1 py-4 text-base font-bold rounded-2xl shadow-lg shadow-primary/20">{editingItem ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CategoryManagement;
