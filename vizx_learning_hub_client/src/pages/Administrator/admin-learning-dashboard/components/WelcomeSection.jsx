import React from 'react';

const WelcomeSection = ({ userName }) => {
  return (
    <div className="space-y-2">
      <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">System Oversight</span>
      <h2 className="text-4xl font-black tracking-tight leading-none">
        Welcome back, <span className="text-primary">{userName}</span>.
      </h2>
      <p className="text-muted-foreground font-medium max-w-4xl leading-relaxed">
        Welcome to the Vizx Learning Hub
      </p>
    </div>
  );
};

export default WelcomeSection;
