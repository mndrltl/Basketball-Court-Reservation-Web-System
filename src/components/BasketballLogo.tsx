import React from 'react';

interface BasketballLogoProps {
  className?: string;
}

export const BasketballLogo: React.FC<BasketballLogoProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
    <path
      d="M6.5 24h35M24 6.5v35M11.3 11.3c8.4 8.4 17 17 25.4 25.4m0-25.4c-8.4 8.4-17 17-25.4 25.4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.5"
    />
  </svg>
);
