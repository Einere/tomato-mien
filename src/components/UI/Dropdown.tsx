import React, { useState, type ReactNode } from 'react';
import { Button } from './';
import { useOutsideClick } from '@/hooks/useOutsideClick';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  className?: string;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
  dropdownClassName?: string;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  className = '',
  dropdownClassName = '',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  const alignmentClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className='cursor-pointer'>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 ${alignmentClasses} ${dropdownClassName}`}
        >
          {items.map((item, index) => (
            <Button
              key={index}
              onClick={() => handleItemClick(item)}
              variant='ghost'
              className={`w-full justify-start ${index === 0 ? 'rounded-t-lg' : ''} ${index === items.length - 1 ? 'rounded-b-lg' : ''} ${item.className || ''}`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
