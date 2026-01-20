import React from 'react';
import Icon from '../../../../components/AppIcon';

const AIInsightsPanel = ({ insights = [] }) => {
  const getIconColor = (color) => {
    const colors = { success: 'text-success', warning: 'text-warning', primary: 'text-primary', destructive: 'text-destructive' };
    return colors[color] || 'text-muted-foreground';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Zap" size={24} className="text-primary" />
        <h3 className="text-xl font-bold text-foreground">AI-Powered Insights</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2"><Icon name={insight.icon} size={20} className={getIconColor(insight.color)} /><span className="font-semibold text-foreground">{insight.title}</span></div>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightsPanel;