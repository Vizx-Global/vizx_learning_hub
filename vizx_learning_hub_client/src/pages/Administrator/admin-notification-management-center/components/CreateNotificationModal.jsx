import React, { useState } from 'react';
import { X, Send, Sparkles, Link as LinkIcon, Users, Bell, Info } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Textarea from '../../../../components/ui/TextArea';
import { motion, AnimatePresence } from 'framer-motion';

const CreateNotificationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM',
    audience: 'all',
    actionUrl: '',
    actionLabel: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      message: '',
      type: 'SYSTEM',
      audience: 'all',
      actionUrl: '',
      actionLabel: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card border border-border rounded-[2.5rem] max-w-2xl w-full shadow-2xl shadow-primary/10 overflow-hidden"
        >
          <div className="p-8 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bell className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Generate Notification</h2>
                  <p className="text-sm text-muted-foreground">Broadcast messages to your learners</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Campaign Title</label>
                <Input
                  placeholder="e.g. New AI Course is Now Live!"
                  value={formData.title}
                  onChange={(val) => setFormData({ ...formData, title: val?.target?.value || val })}
                  className="w-full rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Message Content</label>
                <Textarea
                  placeholder="Write a compelling message for your learners..."
                  value={formData.message}
                  onChange={(val) => setFormData({ ...formData, message: val?.target?.value || val })}
                  rows={4}
                  className="w-full rounded-2xl bg-muted/30 border-border/50 focus:bg-background resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Delivery Channel</label>
                  <Select
                    options={[
                      { value: 'SYSTEM', label: 'In-App System' },
                      { value: 'ACHIEVEMENT', label: 'Achievement Style' },
                      { value: 'WELCOME', label: 'Welcome Style' },
                    ]}
                    value={formData.type}
                    onChange={(val) => setFormData({ ...formData, type: val })}
                    className="w-full rounded-2xl bg-muted/30 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Target Segment</label>
                  <Select
                    options={[
                      { value: 'all', label: 'All Active Users' },
                      { value: 'engineering', label: 'Engineering Dept' },
                      { value: 'sales', label: 'Sales & Growth' },
                      { value: 'marketing', label: 'Marketing Team' },
                    ]}
                    value={formData.audience}
                    onChange={(val) => setFormData({ ...formData, audience: val })}
                    className="w-full rounded-2xl bg-muted/30 border-border/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-1.5">
                    <LinkIcon size={12} /> Action URL <span className="text-[10px] font-medium opacity-50">(Optional)</span>
                  </label>
                  <Input
                    placeholder="/employee-courses/..."
                    value={formData.actionUrl}
                    onChange={(val) => setFormData({ ...formData, actionUrl: val?.target?.value || val })}
                    className="w-full rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Button Label</label>
                  <Input
                    placeholder="e.g. View Course"
                    value={formData.actionLabel}
                    onChange={(val) => setFormData({ ...formData, actionLabel: val?.target?.value || val })}
                    className="w-full rounded-2xl bg-muted/30 border-border/50 focus:bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-start gap-3">
              <Sparkles className="text-primary mt-1 shrink-0" size={18} />
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Campaign Insight</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Broadcasting to <strong>{formData.audience === 'all' ? 'all 1,247' : formData.audience}</strong> learners. Notifications with action buttons have a <strong>42% higher</strong> engagement rate.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-wider border-border hover:bg-muted"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-[2] rounded-2xl h-12 font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
              >
                <div className="flex items-center justify-center gap-2">
                  <Send size={18} />
                  <span>Broadcast Notification</span>
                </div>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateNotificationModal;