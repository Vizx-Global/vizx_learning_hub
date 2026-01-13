import React, { useState } from 'react';
import Icon from '../AppIcon';

const RoleBasedMenuSection = ({ 
  section, 
  items = [], 
  userRole = 'employee', 
  isCollapsed = false,
  onNavigate,
  activeRoute = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredItems = items?.filter(item => 
    !item?.roles || item?.roles?.includes(userRole)
  );

  if (filteredItems?.length === 0) {
    return null;
  }

  const isActive = (path) => activeRoute === path;

  const handleItemClick = (item) => {
    if (item?.onClick) {
      item?.onClick();
    } else if (item?.path && onNavigate) {
      onNavigate(item?.path);
    }
  };

  const toggleExpanded = () => {
    if (!isCollapsed) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-1">
      {/* Section Header */}
      {!isCollapsed && (
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-accent/50 rounded-lg transition-colors duration-200"
        >
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {section}
          </h3>
          {filteredItems?.length > 1 && (
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={14} 
              className="text-muted-foreground transition-transform duration-200"
            />
          )}
        </button>
      )}
      {/* Menu Items */}
      <div className={`
        space-y-1 transition-all duration-300 ease-in-out
        ${!isCollapsed && !isExpanded ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-none opacity-100'}
      `}>
        {filteredItems?.map((item, index) => {
          const itemIsActive = isActive(item?.path);
          
          return (
            <div key={item?.id || item?.path || index} className="relative">
              <button
                onClick={() => handleItemClick(item)}
                disabled={item?.disabled}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                  transition-all duration-200 ease-out group relative
                  ${itemIsActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : item?.disabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item?.label : undefined}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={`
                      transition-colors duration-200
                      ${itemIsActive ? 'text-primary-foreground' : 'text-current'}
                    `}
                  />
                </div>

                {/* Label and Badge */}
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="font-medium text-sm truncate">
                      {item?.label}
                    </span>
                    
                    {/* Badges and Indicators */}
                    <div className="flex items-center gap-2 ml-2">
                      {item?.badge && (
                        <span className={`
                          text-xs px-2 py-0.5 rounded-full font-medium
                          ${item?.badge?.variant === 'success' ? 'bg-success/10 text-success' :
                            item?.badge?.variant === 'warning' ? 'bg-warning/10 text-warning' :
                            item?.badge?.variant === 'error'? 'bg-error/10 text-error' : 'bg-accent text-accent-foreground'
                          }
                        `}>
                          {item?.badge?.text}
                        </span>
                      )}
                      
                      {item?.notification && (
                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      )}
                      
                      {item?.isNew && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Indicator */}
                {itemIsActive && (
                  <div className="absolute right-2">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full opacity-60" />
                  </div>
                )}

                {/* Hover Effect */}
                <div className={`
                  absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  ${!itemIsActive && !item?.disabled ? 'bg-accent/20' : ''}
                `} />
              </button>
              {/* Tooltip for Collapsed State */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                  {item?.label}
                  {item?.description && (
                    <div className="text-muted-foreground mt-1">
                      {item?.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleBasedMenuSection;