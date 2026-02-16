import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Calendar, Activity } from 'lucide-react';
import Icon from '../../../../components/AppIcon';

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
  return date.toISOString().split('T')[0];
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

const GlobalControlBar = ({ activePreset, setActivePreset, dateRange, setDateRange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [tempStartDate, setTempStartDate] = useState(
    formatDate(dateRange?.from || getStartOfDay(new Date()))
  );
  const [tempEndDate, setTempEndDate] = useState(
    formatDate(dateRange?.to || getEndOfDay(new Date()))
  );

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
        return;
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
    setActivePreset('Custom');
    setIsExpanded(false);
  };

  const handlePeriodSelect = (period) => {
    const label = periodOptions.find(o => o.value === period)?.label || period;
    setActivePreset(label);
    if (period !== 'custom') {
      setIsExpanded(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[2.5rem] border border-border/50 bg-[#000000] backdrop-blur-md transition-all duration-200 shadow-xl overflow-hidden"
    >
      <motion.div
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Activity size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight hidden sm:inline">Date Range</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Global Date Filter</p>
            </div>
          </div>
          
          <div className="h-10 w-px bg-border/50 hidden md:block" />

          <div className="flex items-center space-x-4">
             <div className="flex items-center gap-3">
                <span className="text-xs font-black text-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-xl border border-border/50">
                    {getCurrentPeriodLabel()}
                </span>
                <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                    {getFormattedDateRangeString()}
                </span>
             </div>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="p-3 rounded-2xl bg-muted/30 text-muted-foreground hover:text-primary transition-colors border border-border/30"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="p-8 space-y-8 bg-gradient-to-b from-transparent to-muted/5">
              <div className="space-y-4">
                <label className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">
                  <Clock className="h-4 w-4 mr-3 text-primary" />
                  Temporal Preset Selection
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {periodOptions.map((option) => {
                    const isActive = activePreset?.toLowerCase()?.replace(/\s+/g, '') === option.value.toLowerCase();
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handlePeriodSelect(option.value)}
                        className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105"
                            : "text-muted-foreground bg-black hover:bg-muted border-border/50"
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="mr-2 text-base">{option.icon}</span>
                        <span>{option.label}</span>
                      </motion.button>
                    );
                  })}
                  <button
                    onClick={() => handlePeriodSelect('All Time')}
                    className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        activePreset === 'All Time'
                          ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105"
                          : "text-muted-foreground bg-black hover:bg-muted border-border/50"
                      }`}
                  >
                    <span className="mr-2 text-base">♾️</span>
                    <span>All Time</span>
                  </button>
                </div>
              </div>

              {(activePreset?.toLowerCase() === 'custom' || activePreset === 'Custom Range') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 p-6 bg-muted/20 backdrop-blur-md rounded-3xl border border-primary/20 shadow-inner"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                        <Calendar size={20} />
                    </div>
                    <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                      Specify Custom Vector
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Deployment Start
                      </label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-5 py-4 text-xs border border-border/50 bg-[#000000] text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest"
                        max={tempEndDate}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Deployment Terminus
                      </label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="w-full px-5 py-4 text-xs border border-border/50 bg-[#000000] text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold uppercase tracking-widest"
                        min={tempStartDate}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button
                      onClick={handleCustomDateApply}
                      className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground bg-primary rounded-2xl shadow-xl shadow-primary/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Initialize Vector
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between pt-6 border-t border-border/50"
              >
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Temporal sync vector:</span>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                    {dateRange?.from ? `${formatDisplayDate(dateRange.from)} — ${formatDisplayDate(dateRange.to)}` : 'Omni-temporal analysis active'}
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

export default GlobalControlBar;
