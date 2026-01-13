import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Constants and Types
const INTEGRATIONS_INITIAL = [
  {
    id: 'microsoft-learn',
    name: 'Microsoft Learn',
    description: 'Sync learning content from Microsoft Learn',
    icon: 'Cloud',
    status: 'connected',
    lastSync: new Date(Date.now() - 3600000),
    config: { apiKey: '••••••••', autoSync: true }
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Send notifications to Teams channels',
    icon: 'MessageSquare',
    status: 'connected',
    lastSync: new Date(Date.now() - 7200000),
    config: { webhookUrl: '••••••••' }
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Integration with Slack workspace',
    icon: 'Hash',
    status: 'disconnected',
    lastSync: null,
    config: {}
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track user engagement and analytics',
    icon: 'BarChart3',
    status: 'connected',
    lastSync: new Date(),
    config: { trackingId: 'UA-••••••••' }
  }
];

const WEBHOOKS_INITIAL = [
  { 
    event: 'user.registered', 
    url: 'https://api.example.com/webhooks/user' 
  },
  { 
    event: 'module.completed', 
    url: 'https://api.example.com/webhooks/progress' 
  }
];

const EXPORT_FORMATS = [
  { format: 'CSV', icon: 'FileText' },
  { format: 'JSON', icon: 'Code' },
  { format: 'Excel', icon: 'Table' }
];

// Custom Hook
const useIntegrations = () => {
  const [integrations, setIntegrations] = useState(INTEGRATIONS_INITIAL);
  const [webhooks, setWebhooks] = useState(WEBHOOKS_INITIAL);

  const handleToggleIntegration = useCallback((integrationId) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected',
            lastSync: integration.status === 'connected' ? null : new Date()
          }
        : integration
    ));
  }, []);

  const handleAddWebhook = useCallback(() => {
    const newWebhook = {
      event: `user.activity.${webhooks.length + 1}`,
      url: `https://api.example.com/webhooks/event${webhooks.length + 1}`
    };
    setWebhooks(prev => [...prev, newWebhook]);
  }, [webhooks.length]);

  const handleDeleteWebhook = useCallback((index) => {
    setWebhooks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleEditWebhook = useCallback((index) => {
    console.log('Edit webhook:', webhooks[index]);
    // Implement webhook editing logic
  }, [webhooks]);

  return {
    integrations,
    webhooks,
    handleToggleIntegration,
    handleAddWebhook,
    handleDeleteWebhook,
    handleEditWebhook
  };
};

// Sub-components
const IntegrationHeader = () => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">Integration Settings</h3>
    <p className="text-sm text-muted-foreground">
      Manage third-party integrations and webhooks
    </p>
  </div>
);

const SectionHeader = ({ icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
        <Icon name={icon} size={20} className="text-primary" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

const IntegrationCard = ({ integration, onToggle }) => {
  const isConnected = integration.status === 'connected';
  
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isConnected ? 'bg-success/10' : 'bg-muted'
          }`}>
            <Icon 
              name={integration.icon} 
              size={24} 
              className={isConnected ? 'text-success' : 'text-muted-foreground'}
            />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">{integration.name}</h4>
            <p className="text-sm text-muted-foreground">{integration.description}</p>
          </div>
        </div>
        <StatusBadge status={integration.status} />
      </div>

      {isConnected && integration.lastSync && (
        <LastSyncInfo lastSync={integration.lastSync} />
      )}

      <IntegrationActions 
        isConnected={isConnected}
        onToggle={onToggle}
      />
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
    status === 'connected' 
      ? 'bg-success/10 text-success' 
      : 'bg-muted text-muted-foreground'
  }`}>
    {status}
  </span>
);

const LastSyncInfo = ({ lastSync }) => (
  <div className="mb-4 p-3 bg-accent/30 rounded-lg">
    <div className="text-xs text-muted-foreground">
      Last synced: {lastSync.toLocaleString()}
    </div>
  </div>
);

const IntegrationActions = ({ isConnected, onToggle }) => (
  <div className="flex gap-2">
    <Button
      variant={isConnected ? 'outline' : 'default'}
      size="sm"
      className="flex-1"
      onClick={onToggle}
    >
      {isConnected ? 'Disconnect' : 'Connect'}
    </Button>
    <Button variant="outline" size="sm" iconName="Settings">
      Configure
    </Button>
  </div>
);

const IntegrationsGrid = ({ integrations, onToggleIntegration }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {integrations.map((integration) => (
      <IntegrationCard
        key={integration.id}
        integration={integration}
        onToggle={() => onToggleIntegration(integration.id)}
      />
    ))}
  </div>
);

const WebhooksSection = ({ webhooks, onAddWebhook, onEditWebhook, onDeleteWebhook }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Webhook"
      title="Webhooks"
      subtitle="Configure outgoing webhooks"
      action={
        <Button 
          variant="default" 
          size="sm" 
          iconName="Plus" 
          iconPosition="left"
          onClick={onAddWebhook}
        >
          Add Webhook
        </Button>
      }
    />

    <div className="space-y-3">
      {webhooks.map((webhook, index) => (
        <WebhookItem
          key={index}
          webhook={webhook}
          onEdit={() => onEditWebhook(index)}
          onDelete={() => onDeleteWebhook(index)}
        />
      ))}
    </div>
  </div>
);

const WebhookItem = ({ webhook, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
    <div>
      <div className="font-medium text-foreground">{webhook.event}</div>
      <div className="text-sm text-muted-foreground font-mono">{webhook.url}</div>
    </div>
    <div className="flex items-center gap-2">
      <button 
        className="p-2 hover:bg-accent rounded transition-colors"
        onClick={onEdit}
        aria-label="Edit webhook"
      >
        <Icon name="Edit" size={16} className="text-muted-foreground" />
      </button>
      <button 
        className="p-2 hover:bg-accent rounded transition-colors"
        onClick={onDelete}
        aria-label="Delete webhook"
      >
        <Icon name="Trash2" size={16} className="text-error" />
      </button>
    </div>
  </div>
);

const DataExportSection = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Download"
      title="Data Export"
      subtitle="Configure data export formats and schedules"
      action={null}
    />

    <div className="grid grid-cols-3 gap-4">
      {EXPORT_FORMATS.map(({ format, icon }) => (
        <ExportFormatButton
          key={format}
          format={format}
          icon={icon}
        />
      ))}
    </div>
  </div>
);

const ExportFormatButton = ({ format, icon }) => (
  <button className="p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors text-center group">
    <Icon 
      name={icon} 
      size={24} 
      className="text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" 
    />
    <div className="text-sm font-medium text-foreground">{format}</div>
  </button>
);

// Main Component
const IntegrationSettings = () => {
  const {
    integrations,
    webhooks,
    handleToggleIntegration,
    handleAddWebhook,
    handleDeleteWebhook,
    handleEditWebhook
  } = useIntegrations();

  return (
    <div className="space-y-6">
      <IntegrationHeader />
      
      <IntegrationsGrid
        integrations={integrations}
        onToggleIntegration={handleToggleIntegration}
      />
      
      <WebhooksSection
        webhooks={webhooks}
        onAddWebhook={handleAddWebhook}
        onEditWebhook={handleEditWebhook}
        onDeleteWebhook={handleDeleteWebhook}
      />
      
      <DataExportSection />
    </div>
  );
};

export default IntegrationSettings;