import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#e9f5ff] border-t border-[#ddeaf3] shadow-[0_-1px_6px_rgba(41,53,60,0.03)] py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <span className="font-semibold text-sm text-[#2d4055]">
          Basketball Court Reservation Web System
        </span>
        <span className="text-xs text-[#43474c] tracking-wide">
          © 2026 University of Caloocan City. All rights reserved.
        </span>
      </div>
    </footer>
  );
};
