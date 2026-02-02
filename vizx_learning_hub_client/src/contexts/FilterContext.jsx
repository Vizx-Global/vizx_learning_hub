import React, { createContext, useContext, useState } from 'react';
import { startOfToday, subDays, startOfMonth } from 'date-fns';

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: startOfToday(),
  });
  const [activePreset, setActivePreset] = useState('Month'); // 'Today', 'Last Week', 'Month', 'All Time', 'Custom'

  const setFilter = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    
    switch (preset) {
      case 'Today':
        setDateRange({ from: startOfToday(), to: startOfToday() });
        break;
      case 'Last Week':
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case 'Month':
        setDateRange({ from: startOfMonth(now), to: now });
        break;
      case 'All Time':
        setDateRange(undefined); // undefined means no filter / all time
        break;
      default:
        // Custom or other presets don't auto-set range immediately unless passed explicitly
        break;
    }
  };

  const setCustomRange = (range) => {
    setDateRange(range);
    setActivePreset('Custom');
  };

  return (
    <FilterContext.Provider value={{ dateRange, setDateRange: setCustomRange, activePreset, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
