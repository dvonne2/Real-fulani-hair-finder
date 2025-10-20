import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const pct = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full max-w-[800px] h-[6px] bg-black/5 rounded-[10px] mx-auto overflow-hidden shadow-inner">
      <div
        className="h-full rounded-[10px]"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #ff8e53, #feca57)',
          boxShadow: '0 0 20px rgba(255,142,83,0.4)',
          transition: 'width 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      />
    </div>
  );
};