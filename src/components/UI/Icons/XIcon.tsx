import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  fill?: string;
}

export const XIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M6 18L18 6M6 6l12 12'
    />
  </svg>
);
