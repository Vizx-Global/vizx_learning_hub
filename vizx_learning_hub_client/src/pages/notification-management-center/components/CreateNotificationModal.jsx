import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/TextArea';

const CreateNotificationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'email',
    audience: 'all',
    scheduledDate: '',
    scheduledTime: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      message: '',
      type: 'email',
      audience: 'all',
      scheduledDate: '',
      scheduledTime: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Create Notification</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <Icon name="X" size={24} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Notification Title"
            placeholder="Enter notification title..."
            value={formData.title}
            onChange={(val) => setFormData({ ...formData, title: val })}
            className="w-full"
          />

          <Textarea
            label="Message"
            placeholder="Enter your notification message..."
            value={formData.message}
            onChange={(val) => setFormData({ ...formData, message: val })}
            rows={6}
            className="w-full"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Notification Type"
              options={[
                { value: 'email', label: 'Email' },
                { value: 'push', label: 'Push Notification' },
                { value: 'in-app', label: 'In-App' },
                { value: 'sms', label: 'SMS' }
              ]}
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
            />

            <Select
              label="Target Audience"
              options={[
                { value: 'all', label: 'All Users' },
                { value: 'engineering', label: 'Engineering' },
                { value: 'sales', label: 'Sales' },
                { value: 'q1-2024', label: 'Q1 2024 Cohort' },
                { value: 'active', label: 'Active Learners' }
              ]}
              value={formData.audience}
              onChange={(val) => setFormData({ ...formData, audience: val })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.scheduledDate}
              onChange={(val) => setFormData({ ...formData, scheduledDate: val })}
            />

            <Input
              label="Scheduled Time"
              type="time"
              value={formData.scheduledTime}
              onChange={(val) => setFormData({ ...formData, scheduledTime: val })}
            />
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Sparkles" size={20} className="text-primary mt-1" />
              <div>
                <div className="font-semibold text-foreground mb-1">AI Suggestion</div>
                <p className="text-sm text-muted-foreground">
                  Based on user engagement patterns, sending this notification between 9-11 AM
                  on weekdays yields 28% higher open rates.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              fullWidth
              iconName="Send"
              iconPosition="left"
            >
              Schedule Notification
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;