import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const LearningHistoryPanel = ({ learningHistory }) => {
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded?.has(moduleId)) {
      newExpanded?.delete(moduleId);
    } else {
      newExpanded?.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-success bg-success/10';
      case 'In Progress': return 'text-primary bg-primary/10';
      case 'Not Started': return 'text-muted-foreground bg-muted';
      case 'Failed': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-primary';
    if (score >= 50) return 'text-warning';
    return 'text-error';
  };

  const filteredHistory = learningHistory?.filter(item => {
    if (filterStatus === 'all') return true;
    return item?.status?.toLowerCase()?.replace(' ', '_') === filterStatus;
  });

  const sortedHistory = [...filteredHistory]?.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastAccessed) - new Date(a.lastAccessed);
      case 'score':
        return (b?.score || 0) - (a?.score || 0);
      case 'progress':
        return b?.progress - a?.progress;
      case 'name':
        return a?.title?.localeCompare(b?.title);
      default:
        return 0;
    }
  });

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Learning History</h2>
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="recent">Most Recent</option>
            <option value="score">Highest Score</option>
            <option value="progress">Progress</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>
      {/* Learning History List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedHistory?.map((item) => (
          <div key={item?.id} className="border border-border rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors duration-200"
              onClick={() => toggleModule(item?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{item?.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item?.status)}`}>
                      {item?.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      <span>{item?.timeSpent}h spent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      <span>Last: {item?.lastAccessed}</span>
                    </div>
                    {item?.score && (
                      <div className="flex items-center gap-1">
                        <Icon name="Target" size={14} />
                        <span className={getScoreColor(item?.score)}>Score: {item?.score}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{item?.progress}%</div>
                    <div className="w-20 h-2 bg-muted rounded-full mt-1">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${item?.progress}%` }}
                      />
                    </div>
                  </div>
                  <Icon
                    name={expandedModules?.has(item?.id) ? "ChevronUp" : "ChevronDown"}
                    size={20}
                    className="text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedModules?.has(item?.id) && (
              <div className="px-4 pb-4 border-t border-border bg-muted/30">
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Module Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span className="text-foreground">{item?.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Time:</span>
                        <span className="text-foreground">{item?.estimatedTime}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <span className="text-foreground">{item?.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="text-foreground">{item?.category}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Performance</h4>
                    <div className="space-y-2 text-sm">
                      {item?.quizScores && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quiz Average:</span>
                          <span className={`font-medium ${getScoreColor(item?.quizScores?.average)}`}>
                            {item?.quizScores?.average}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attempts:</span>
                        <span className="text-foreground">{item?.attempts || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points Earned:</span>
                        <span className="text-success font-medium">{item?.pointsEarned}</span>
                      </div>
                      {item?.certificate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Certificate:</span>
                          <button className="text-primary hover:text-primary/80 text-sm font-medium">
                            View Certificate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200">
                    <Icon name="Play" size={14} />
                    Continue Learning
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors duration-200">
                    <Icon name="RotateCcw" size={14} />
                    Restart Module
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors duration-200">
                    <Icon name="Download" size={14} />
                    Export Progress
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningHistoryPanel;