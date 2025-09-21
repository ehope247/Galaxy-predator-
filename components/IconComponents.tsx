import React from 'react';

export const FootballIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 0-4.47 1.22M12 22a10 10 0 0 0 4.47-1.22" />
        <path d="M2.05 15.24A10 10 0 0 0 12 22M21.95 15.24A10 10 0 0 1 12 22" />
        <path d="M2.05 8.76A10 10 0 0 1 12 2M21.95 8.76A10 10 0 0 0 12 2" />
        <path d="M12 2v20" />
        <path d="M16.47 3.22L7.53 20.78" />
        <path d="M3.22 7.53l17.56 9.94" />
        <path d="M3.22 16.47l17.56-9.94" />
        <path d="M7.53 3.22l9.94 17.56" />
    </svg>
);

export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
