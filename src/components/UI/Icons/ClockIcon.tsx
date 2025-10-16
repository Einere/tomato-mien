import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export const ClockIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
