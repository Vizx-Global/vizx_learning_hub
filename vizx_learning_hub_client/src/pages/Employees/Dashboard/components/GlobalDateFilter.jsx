import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Clock, Calendar, Activity } from 'lucide-react';

const periodOptions = [
  { value: 'today', label: 'Today', icon: '🕐' },
  { value: 'yesterday', label: 'Yesterday', icon: '📅' },
  { value: 'last7days', label: 'Last 7 Days', icon: '📆' },
  { value: 'currentMonth', label: 'Current Month', icon: '🗓️' },
  { value: 'lastMonth', label: 'Last Month', icon: '📊' },
  { value: 'custom', label: 'Custom Range', icon: '📅' },
];

const formatDate = (date) => {
  if (!date) return '';
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const formatDisplayDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatShortDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const getStartOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getEndOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

const GlobalDateFilter = ({ activePreset, setFilter, dateRange, setDateRange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Initialize local states from props/defaults
  const [tempStartDate, setTempStartDate] = useState(
    formatDate(dateRange?.from || getStartOfDay(new Date()))
  );
  const [tempEndDate, setTempEndDate] = useState(
    formatDate(dateRange?.to || getEndOfDay(new Date()))
  );

  // Sync internal state when external preset changes
  useEffect(() => {
    const now = new Date();
    let newStartDate;
    let newEndDate;

    const normalizedPreset = activePreset?.toLowerCase()?.replace(/\s+/g, '') || 'today';

    switch (normalizedPreset) {
      case 'today':
        newStartDate = getStartOfDay(now);
        newEndDate = getEndOfDay(now);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        newStartDate = getStartOfDay(yesterday);
        newEndDate = getEndOfDay(yesterday);
        break;
      case 'last7days':
      case 'lastweek':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);
        newStartDate = getStartOfDay(sevenDaysAgo);
        newEndDate = getEndOfDay(now);
        break;
      case 'currentmonth':
      case 'month':
        newStartDate = getStartOfMonth(now);
        newEndDate = getEndOfDay(now);
        break;
      case 'lastmonth':
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        newStartDate = getStartOfMonth(lastMonth);
        newEndDate = getEndOfMonth(lastMonth);
        break;
      case 'alltime':
        newStartDate = null;
        newEndDate = null;
        break;
      case 'custom':
        return; // Don't override custom range
      default:
        return;
    }

    if (normalizedPreset !== 'custom') {
      const isSame = 
        dateRange?.from?.getTime() === newStartDate?.getTime() && 
        dateRange?.to?.getTime() === newEndDate?.getTime();
        
      if (!isSame) {
        setDateRange({ from: newStartDate, to: newEndDate });
      }
      
      if (newStartDate) setTempStartDate(formatDate(newStartDate));
      if (newEndDate) setTempEndDate(formatDate(newEndDate));
    }
  }, [activePreset]);

  const getCurrentPeriodLabel = () => {
    const normalized = activePreset?.toLowerCase()?.replace(/\s+/g, '');
    const option = periodOptions.find((opt) => opt.value.toLowerCase() === normalized);
    return option ? option.label : activePreset || 'Custom Range';
  };

  const getFormattedDateRangeString = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const from = dateRange?.from;
    const to = dateRange?.to;

    if (!from) return 'All Time';

    const normalized = activePreset?.toLowerCase()?.replace(/\s+/g, '');

    switch (normalized) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last7days':
      case 'lastweek':
        return `${monthNames[from.getMonth()]} ${from.getDate()} - ${monthNames[to.getMonth()]} ${to.getDate()}`;
      case 'currentmonth':
      case 'month':
        return monthNames[from.getMonth()];
      case 'lastmonth':
        return monthNames[from.getMonth()];
      case 'custom':
        return `${formatShortDate(from)} - ${formatShortDate(to)}`;
      default:
        return `${monthNames[from.getMonth()]} ${from.getDate()} - ${monthNames[to.getMonth()]} ${to.getDate()}, ${to.getFullYear()}`;
    }
  };

  const handleCustomDateApply = () => {
    const newStartDate = new Date(tempStartDate);
    const newEndDate = new Date(tempEndDate);

    if (newStartDate > newEndDate) {
      alert("Start date cannot be after end date");
      return;
    }

    setDateRange({ 
      from: getStartOfDay(newStartDate), 
      to: getEndOfDay(newEndDate) 
    });
    setFilter('Custom');
    setIsExpanded(false);
  };

  const handlePeriodSelect = (period) => {
    const label = periodOptions.find(o => o.value === period)?.label || period;
    setFilter(label);
    if (period !== 'custom') {
      setIsExpanded(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md transition-all duration-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity size={20} className="stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight hidden sm:inline">Performance Overview</h2>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight sm:hidden">Overview</h2>
          </div>
          
          <div className="h-6 w-px bg-border/50 hidden md:block" />

          <div className="flex items-center space-x-3">
             <div className="flex items-center gap-2">
                <span className="text-sm font-black text-foreground uppercase tracking-wider bg-muted px-3 py-1 rounded-lg">
                    {getCurrentPeriodLabel()}
                </span>
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary uppercase tracking-tighter">
                    {getFormattedDateRangeString()}
                </span>
             </div>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="p-6 space-y-6 bg-gradient-to-b from-transparent to-muted/10">
              {/* Period Selector */}
              <div className="space-y-3">
                <label className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  <Clock className="h-3 w-3 mr-2 text-primary" />
                  Select Time Period
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {periodOptions.map((option) => {
                    const isActive = activePreset?.toLowerCase()?.replace(/\s+/g, '') === option.value.toLowerCase();
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handlePeriodSelect(option.value)}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                            : "text-muted-foreground bg-card hover:bg-muted border border-border/50"
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="mr-2">{option.icon}</span>
                        <span>{option.label}</span>
                      </motion.button>
                    );
                  })}
                  <button
                    onClick={() => setFilter('All Time')}
                    className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activePreset === 'All Time'
                          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                          : "text-muted-foreground bg-card hover:bg-muted border border-border/50"
                      }`}
                  >
                    ♾️ All Time
                  </button>
                </div>
              </div>

              {/* Custom Date Range Inputs */}
              {(activePreset?.toLowerCase() === 'custom' || activePreset === 'Custom Range') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 p-5 bg-card/80 backdrop-blur-md rounded-2xl border border-primary/20 shadow-inner"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Calendar size={18} />
                    </div>
                    <span className="text-sm font-black text-foreground uppercase tracking-wider">
                      Specify Custom Range
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        max={tempEndDate}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        min={tempStartDate}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button
                      onClick={handleCustomDateApply}
                      className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground bg-primary rounded-xl shadow-lg shadow-primary/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply Range
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Active Period Display Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between pt-4 border-t border-border/50"
              >
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected range:</span>
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-primary" />
                    <span className="text-xs font-black text-foreground">
                    {dateRange?.from ? `${formatDisplayDate(dateRange.from)} - ${formatDisplayDate(dateRange.to)}` : 'Full History Selected'}
                    </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GlobalDateFilter;
